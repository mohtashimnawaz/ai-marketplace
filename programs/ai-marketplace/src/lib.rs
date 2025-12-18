use anchor_lang::prelude::*;

declare_id!("8g37Z8wZR9xMaHQRP8W8FzWqAj1A8VRt2c4t6LnBqAyb");

#[program]
pub mod ai_marketplace {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
