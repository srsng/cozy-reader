use cozy_database_codegen::{export_types, generate_entities, generate_enums};

fn main() {
    generate_enums::generate_enums().unwrap();
    generate_entities::generate_entities().unwrap();
    export_types::export_types().unwrap();
}
