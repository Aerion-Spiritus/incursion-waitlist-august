use crate::{
    app::Application, core::auth::AuthenticatedAccount, util::{
        madness::Madness, types::{Character, Entity, Whitelist},
    },
};

use rocket::serde::json::Json;
use sqlx::types::chrono::Utc;



#[get("/api/v1/whitelist")]
async fn list(
    app: &rocket::State<Application>,
    account: AuthenticatedAccount
) -> Result<Json<Vec<Whitelist>>, Madness> {
    account.require_access("whitelist-manage")?;

    let now = Utc::now().timestamp();

    let rows = sqlx::query!(
        "SELECT
            w.id,
            alliance.id AS alliance_id,
            alliance.name AS alliance_name,
            issued_at,
            issued_by_id,
            issued_by.name AS issued_by_name

        FROM alliance_whitelist AS w
        
        JOIN alliance ON w.alliance_id = alliance.id
        JOIN `character` AS issued_by ON issued_by_id = issued_by.id
        
        WHERE revoked_at IS NULL OR revoked_at > ?",
        now
    )
    .fetch_all(app.get_db())
    .await?;

    let whitelist = rows.into_iter().map(|whitelist| Whitelist {
        id: Some(whitelist.id),
        entity: Some(Entity {
            id: whitelist.alliance_id,
            name: Some(whitelist.alliance_name),
            category: "alliance".to_owned()
        }),
        issued_at: whitelist.issued_at,
        issued_by: Some(Character {
            id: whitelist.issued_by_id,
            name: whitelist.issued_by_name,
            corporation_id: None
        })
    })
    .collect();

    return Ok(Json(whitelist));
}

pub fn routes() -> Vec<rocket::Route> {
    routes![
        list,   // GET      /api/v1/whitelist
        //create, // POST     /api/v1/whitelist
        //revoke  // DELETE   /api/v1/whitelist/<id>
    ]
}