use std::sync::Arc;
use crate::util::madness::Madness;

pub struct WhitelistService {
    db: Arc<crate::DB>,
}

impl WhitelistService {
    pub fn new(database: Arc<crate::DB>) -> WhitelistService {
        WhitelistService { db: database }
    }

    pub async fn compliance_check(&self, character_id: i64) -> Result<(), Madness> {
        let row = sqlx::query!(
            "SELECT c.id
            FROM `character` AS c
            JOIN corporation ON c.corporation_id = corporation.id
            JOIN alliance ON corporation.alliance_id = alliance.id
            JOIN alliance_whitelist AS whitelist ON whitelist.alliance_id = alliance.id
            WHERE c.id = ? AND whitelist.revoked_at IS NULL AND whitelist.revoked_by_id IS NULL",
            character_id
        )
        .fetch_optional(self.db.as_ref())
        .await?;

        if let Some(r) = row {
            if r.id == character_id {
                return Ok(());
            }
        }

        Err(Madness::Forbidden("Your alliance is not authorised to fly with us.".to_string()))
    }         
}
