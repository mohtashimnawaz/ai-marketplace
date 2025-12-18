use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("8g37Z8wZR9xMaHQRP8W8FzWqAj1A8VRt2c4t6LnBqAyb");

const MARKETPLACE_SEED: &[u8] = b"marketplace";
const MODEL_SEED: &[u8] = b"model";
const ACCESS_SEED: &[u8] = b"access";
const USAGE_SEED: &[u8] = b"usage";
const TREASURY_SEED: &[u8] = b"treasury";

// Protocol fee: 2.5%
const PROTOCOL_FEE_BPS: u64 = 250;
const BPS_DENOMINATOR: u64 = 10000;

#[program]
pub mod ai_marketplace {
    use super::*;

    /// Initialize the marketplace
    pub fn initialize_marketplace(
        ctx: Context<InitializeMarketplace>,
        protocol_fee_bps: u64,
    ) -> Result<()> {
        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.authority = ctx.accounts.authority.key();
        marketplace.treasury = ctx.accounts.treasury.key();
        marketplace.protocol_fee_bps = protocol_fee_bps;
        marketplace.total_models = 0;
        marketplace.bump = ctx.bumps.marketplace;
        
        msg!("Marketplace initialized with {}% fee", protocol_fee_bps as f64 / 100.0);
        Ok(())
    }

    /// Register a new AI model
    pub fn register_model(
        ctx: Context<RegisterModel>,
        name: String,
        description: String,
        model_hash: String,
        storage_uri: String,
        model_size: u64,
        inference_price: u64,
        download_price: u64,
        payment_token: PaymentToken,
    ) -> Result<()> {
        require!(name.len() <= 100, ErrorCode::NameTooLong);
        require!(description.len() <= 500, ErrorCode::DescriptionTooLong);
        require!(model_hash.len() <= 64, ErrorCode::HashTooLong);
        require!(storage_uri.len() <= 200, ErrorCode::UriTooLong);

        let model = &mut ctx.accounts.model;
        let marketplace = &mut ctx.accounts.marketplace;

        model.creator = ctx.accounts.creator.key();
        model.name = name.clone();
        model.description = description;
        model.model_hash = model_hash;
        model.storage_uri = storage_uri;
        model.model_size = model_size;
        model.inference_price = inference_price;
        model.download_price = download_price;
        model.payment_token = payment_token;
        model.total_inferences = 0;
        model.total_downloads = 0;
        model.total_revenue = 0;
        model.is_active = true;
        model.created_at = Clock::get()?.unix_timestamp;
        model.model_id = marketplace.total_models;
        model.bump = ctx.bumps.model;

        marketplace.total_models += 1;

        msg!("Model '{}' registered by creator", name);
        Ok(())
    }

    /// Purchase access to a model (for inference or download)
    pub fn purchase_access(
        ctx: Context<PurchaseAccess>,
        access_type: AccessType,
        duration_days: Option<u32>,
    ) -> Result<()> {
        let model = &ctx.accounts.model;
        require!(model.is_active, ErrorCode::ModelInactive);

        let price = match access_type {
            AccessType::Inference => model.inference_price,
            AccessType::Download => model.download_price,
            AccessType::Subscription => {
                let days = duration_days.ok_or(ErrorCode::InvalidDuration)?;
                model.inference_price * days as u64
            }
        };

        // Calculate fees
        let protocol_fee = price
            .checked_mul(ctx.accounts.marketplace.protocol_fee_bps)
            .unwrap()
            .checked_div(BPS_DENOMINATOR)
            .unwrap();
        let creator_amount = price.checked_sub(protocol_fee).unwrap();

        // Transfer payment based on token type
        match model.payment_token {
            PaymentToken::Sol => {
                // Transfer to creator
                let creator_transfer = anchor_lang::system_program::Transfer {
                    from: ctx.accounts.user.to_account_info(),
                    to: ctx.accounts.creator.to_account_info(),
                };
                anchor_lang::system_program::transfer(
                    CpiContext::new(
                        ctx.accounts.system_program.to_account_info(),
                        creator_transfer,
                    ),
                    creator_amount,
                )?;

                // Transfer protocol fee
                let protocol_transfer = anchor_lang::system_program::Transfer {
                    from: ctx.accounts.user.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                };
                anchor_lang::system_program::transfer(
                    CpiContext::new(
                        ctx.accounts.system_program.to_account_info(),
                        protocol_transfer,
                    ),
                    protocol_fee,
                )?;
            }
            PaymentToken::SplToken => {
                // Transfer to creator (SPL Token)
                let creator_transfer = Transfer {
                    from: ctx.accounts.user_token_account.to_account_info(),
                    to: ctx.accounts.creator_token_account.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                };
                token::transfer(
                    CpiContext::new(
                        ctx.accounts.token_program.to_account_info(),
                        creator_transfer,
                    ),
                    creator_amount,
                )?;

                // Transfer protocol fee (SPL Token)
                let protocol_transfer = Transfer {
                    from: ctx.accounts.user_token_account.to_account_info(),
                    to: ctx.accounts.treasury_token_account.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                };
                token::transfer(
                    CpiContext::new(
                        ctx.accounts.token_program.to_account_info(),
                        protocol_transfer,
                    ),
                    protocol_fee,
                )?;
            }
        }

        // Create access record
        let access = &mut ctx.accounts.access;
        access.user = ctx.accounts.user.key();
        access.model = ctx.accounts.model.key();
        access.access_type = access_type;
        access.purchased_at = Clock::get()?.unix_timestamp;
        access.expires_at = if let Some(days) = duration_days {
            Some(access.purchased_at + (days as i64 * 86400))
        } else {
            None
        };
        access.inference_count = 0;
        access.is_active = true;
        access.bump = ctx.bumps.access;

        msg!(
            "Access purchased for model by user for {} lamports",
            price
        );
        Ok(())
    }

    /// Record an inference execution
    pub fn record_inference(
        ctx: Context<RecordInference>,
        inference_hash: String,
    ) -> Result<()> {
        let access = &mut ctx.accounts.access;
        let model = &mut ctx.accounts.model;

        // Verify access is valid
        require!(access.is_active, ErrorCode::AccessExpired);
        if let Some(expires_at) = access.expires_at {
            require!(
                Clock::get()?.unix_timestamp < expires_at,
                ErrorCode::AccessExpired
            );
        }

        // Record inference
        let usage = &mut ctx.accounts.usage;
        usage.user = ctx.accounts.user.key();
        usage.model = ctx.accounts.model.key();
        usage.inference_hash = inference_hash;
        usage.timestamp = Clock::get()?.unix_timestamp;
        usage.bump = ctx.bumps.usage;

        // Update counters
        access.inference_count += 1;
        model.total_inferences += 1;

        msg!("Inference recorded for model");
        Ok(())
    }

    /// Record a model download
    pub fn record_download(ctx: Context<RecordDownload>) -> Result<()> {
        let access = &mut ctx.accounts.access;
        let model = &mut ctx.accounts.model;

        require!(access.is_active, ErrorCode::AccessExpired);
        require!(
            access.access_type == AccessType::Download
                || access.access_type == AccessType::Subscription,
            ErrorCode::InvalidAccessType
        );

        model.total_downloads += 1;

        msg!("Download recorded for model");
        Ok(())
    }

    /// Update model status
    pub fn update_model_status(
        ctx: Context<UpdateModelStatus>,
        is_active: bool,
    ) -> Result<()> {
        let model = &mut ctx.accounts.model;
        model.is_active = is_active;

        msg!("Model status updated to: {}", is_active);
        Ok(())
    }

    /// Update model pricing
    pub fn update_model_pricing(
        ctx: Context<UpdateModelPricing>,
        inference_price: Option<u64>,
        download_price: Option<u64>,
    ) -> Result<()> {
        let model = &mut ctx.accounts.model;

        if let Some(price) = inference_price {
            model.inference_price = price;
        }
        if let Some(price) = download_price {
            model.download_price = price;
        }

        msg!("Model pricing updated");
        Ok(())
    }

    /// Withdraw creator earnings
    pub fn withdraw_earnings(ctx: Context<WithdrawEarnings>, amount: u64) -> Result<()> {
        let model = &ctx.accounts.model;
        
        // Note: In production, track earnings in a separate account
        // This is a simplified version
        
        msg!("Withdrawal of {} requested", amount);
        Ok(())
    }
}

// ============================================================================
// Account Structures
// ============================================================================

#[account]
pub struct Marketplace {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub protocol_fee_bps: u64,
    pub total_models: u64,
    pub bump: u8,
}

impl Marketplace {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 1;
}

#[account]
pub struct Model {
    pub creator: Pubkey,
    pub name: String,
    pub description: String,
    pub model_hash: String,
    pub storage_uri: String,
    pub model_size: u64,
    pub inference_price: u64,
    pub download_price: u64,
    pub payment_token: PaymentToken,
    pub total_inferences: u64,
    pub total_downloads: u64,
    pub total_revenue: u64,
    pub is_active: bool,
    pub created_at: i64,
    pub model_id: u64,
    pub bump: u8,
}

impl Model {
    pub const LEN: usize = 8 + 32 + (4 + 100) + (4 + 500) + (4 + 64) + (4 + 200) 
        + 8 + 8 + 8 + 1 + 8 + 8 + 8 + 1 + 8 + 8 + 1;
}

#[account]
pub struct Access {
    pub user: Pubkey,
    pub model: Pubkey,
    pub access_type: AccessType,
    pub purchased_at: i64,
    pub expires_at: Option<i64>,
    pub inference_count: u64,
    pub is_active: bool,
    pub bump: u8,
}

impl Access {
    pub const LEN: usize = 8 + 32 + 32 + 1 + 8 + (1 + 8) + 8 + 1 + 1;
}

#[account]
pub struct Usage {
    pub user: Pubkey,
    pub model: Pubkey,
    pub inference_hash: String,
    pub timestamp: i64,
    pub bump: u8,
}

impl Usage {
    pub const LEN: usize = 8 + 32 + 32 + (4 + 64) + 8 + 1;
}

// ============================================================================
// Context Structures
// ============================================================================

#[derive(Accounts)]
pub struct InitializeMarketplace<'info> {
    #[account(
        init,
        payer = authority,
        space = Marketplace::LEN,
        seeds = [MARKETPLACE_SEED],
        bump
    )]
    pub marketplace: Account<'info, Marketplace>,

    /// CHECK: Treasury account
    pub treasury: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct RegisterModel<'info> {
    #[account(
        init,
        payer = creator,
        space = Model::LEN,
        seeds = [MODEL_SEED, creator.key().as_ref(), &marketplace.total_models.to_le_bytes()],
        bump
    )]
    pub model: Account<'info, Model>,

    #[account(mut, seeds = [MARKETPLACE_SEED], bump = marketplace.bump)]
    pub marketplace: Account<'info, Marketplace>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PurchaseAccess<'info> {
    #[account(
        init,
        payer = user,
        space = Access::LEN,
        seeds = [ACCESS_SEED, user.key().as_ref(), model.key().as_ref()],
        bump
    )]
    pub access: Account<'info, Access>,

    #[account(mut)]
    pub model: Account<'info, Model>,

    #[account(seeds = [MARKETPLACE_SEED], bump = marketplace.bump)]
    pub marketplace: Account<'info, Marketplace>,

    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: Creator receives payment
    #[account(mut)]
    pub creator: AccountInfo<'info>,

    /// CHECK: Treasury receives protocol fee
    #[account(mut)]
    pub treasury: AccountInfo<'info>,

    // Optional SPL Token accounts
    #[account(mut)]
    pub user_token_account: Option<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub creator_token_account: Option<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub treasury_token_account: Option<Account<'info, TokenAccount>>,

    pub token_program: Option<Program<'info, Token>>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(inference_hash: String)]
pub struct RecordInference<'info> {
    #[account(
        init,
        payer = user,
        space = Usage::LEN,
        seeds = [USAGE_SEED, user.key().as_ref(), model.key().as_ref(), inference_hash.as_bytes()],
        bump
    )]
    pub usage: Account<'info, Usage>,

    #[account(mut, seeds = [ACCESS_SEED, user.key().as_ref(), model.key().as_ref()], bump = access.bump)]
    pub access: Account<'info, Access>,

    #[account(mut)]
    pub model: Account<'info, Model>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RecordDownload<'info> {
    #[account(mut, seeds = [ACCESS_SEED, user.key().as_ref(), model.key().as_ref()], bump = access.bump)]
    pub access: Account<'info, Access>,

    #[account(mut)]
    pub model: Account<'info, Model>,

    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateModelStatus<'info> {
    #[account(
        mut,
        has_one = creator,
        seeds = [MODEL_SEED, creator.key().as_ref(), &model.model_id.to_le_bytes()],
        bump = model.bump
    )]
    pub model: Account<'info, Model>,

    pub creator: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateModelPricing<'info> {
    #[account(
        mut,
        has_one = creator,
        seeds = [MODEL_SEED, creator.key().as_ref(), &model.model_id.to_le_bytes()],
        bump = model.bump
    )]
    pub model: Account<'info, Model>,

    pub creator: Signer<'info>,
}

#[derive(Accounts)]
pub struct WithdrawEarnings<'info> {
    #[account(
        mut,
        has_one = creator,
        seeds = [MODEL_SEED, creator.key().as_ref(), &model.model_id.to_le_bytes()],
        bump = model.bump
    )]
    pub model: Account<'info, Model>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// ============================================================================
// Enums and Types
// ============================================================================

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum AccessType {
    Inference,
    Download,
    Subscription,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PaymentToken {
    Sol,
    SplToken,
}

// ============================================================================
// Error Codes
// ============================================================================

#[error_code]
pub enum ErrorCode {
    #[msg("Model name is too long (max 100 characters)")]
    NameTooLong,
    #[msg("Description is too long (max 500 characters)")]
    DescriptionTooLong,
    #[msg("Hash is too long (max 64 characters)")]
    HashTooLong,
    #[msg("URI is too long (max 200 characters)")]
    UriTooLong,
    #[msg("Model is not active")]
    ModelInactive,
    #[msg("Access has expired")]
    AccessExpired,
    #[msg("Invalid access type for this operation")]
    InvalidAccessType,
    #[msg("Invalid duration for subscription")]
    InvalidDuration,
}
