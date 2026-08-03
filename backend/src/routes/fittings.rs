use crate::data::yamlhelper;
use crate::util::madness::Madness;
use eve_data_core::TypeID;
use rocket::serde::json::Json;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

#[derive(Debug, Serialize)]
pub struct DNAFitting {
    pub name: String,
    pub dna: String,
}
#[derive(Debug, Serialize)]
struct FittingResponse {
    fittingdata: Option<Vec<DNAFitting>>,
    notes: Option<Vec<FittingNote>>,
    categories: Option<BTreeMap<String, Vec<i32>>>
}

#[derive(Debug, Deserialize, Serialize)]
pub struct FittingNote {
    pub name: String,
    pub description: String,
}

#[derive(Debug, Deserialize)]
struct NoteFile {
    notes: Vec<FittingNote>,
}

fn load_notes_from_file() -> Vec<FittingNote> {
    let file: NoteFile = yamlhelper::from_file("./data/fitnotes.yaml");
    file.notes
}

#[get("/api/fittings")]
async fn fittings() -> Result<Json<FittingResponse>, Madness> {
    let mut fittingformatted = BTreeMap::new();
    let mut id = 0;

    for fit in crate::data::fits::get_fits().values().flatten() {
        if fit.hidden {
            continue;
        }

        let fitname = fit.name.clone();
        let dna = fit.fit.to_dna().unwrap();

        fittingformatted.entry(id).or_insert_with(|| DNAFitting {
            name: fitname,
            dna: dna.clone(),
        });
        id += 1;
    }

    // Inform the UI about the relationship between typeIDs and categories
    let mut categories: BTreeMap<String, Vec<i32>> = BTreeMap::new();
    for (type_id, foo) in crate::data::categories::rules() {
        categories.entry(foo.clone())
        .or_insert_with(Vec::new)
        .push(type_id.clone());        
    }

    Ok(Json(FittingResponse {
        fittingdata: Some(
            fittingformatted
                .into_iter()
                .map(|(_id, entry)| entry)
                .collect(),
        ),
        notes: Some(load_notes_from_file()),
        categories: Some(categories)
    }))
}

pub fn routes() -> Vec<rocket::Route> {
    routes![fittings]
}
