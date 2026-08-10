use crate::{
    app::Application, core::auth::AuthenticatedAccount, util::{
        madness::Madness, types::{Character, Entity, Whitelist},
    },
};
use rocket::serde::json::Json;
use serde::Deserialize;
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

#[derive(Deserialize)]
struct WhitelistRequest {
    id: i64,
    name: String,
}

#[post("/api/v1/whitelist", data = "<req_body>")]
async fn create(
    app: &rocket::State<Application>,
    account: AuthenticatedAccount,
    req_body: Json<WhitelistRequest>,
) -> Result<&'static str, Madness> {
    account.require_access("whitelist-manage")?;

    let now = Utc::now().timestamp();

    sqlx::query!(
        "INSERT IGNORE INTO alliance (id, name)
        VALUES (?, ?)",
        req_body.id,
        req_body.name
    )
    .execute(app.get_db())
    .await?;

    sqlx::query!(
        "INSERT INTO alliance_whitelist (alliance_id, issued_at, issued_by_id)
        VALUES (?, ?, ?)",
        req_body.id,
        now,
        account.id
    )
    .execute(app.get_db())
    .await?;

    return Ok("Ok");
}


#[delete("/api/v1/whitelist/<whitelist_id>")]
async fn revoke(
    app: &rocket::State<Application>,
    account: AuthenticatedAccount,
    whitelist_id: i64,
) -> Result<&'static str, Madness> {
    account.require_access("whitelist-manage")?;

    let now = Utc::now().timestamp();
    
    sqlx::query!(
        "UPDATE alliance_whitelist SET revoked_at=?, revoked_by_id=? WHERE id=?",
        now,
        account.id,
        whitelist_id
    )
    .execute(app.get_db())
    .await?;

    return Ok("Ok");
}

pub fn routes() -> Vec<rocket::Route> {
    routes![
        list,   // GET      /api/v1/whitelist
        create, // POST     /api/v1/whitelist
        revoke  // DELETE   /api/v1/whitelist/<id>
    ]
}