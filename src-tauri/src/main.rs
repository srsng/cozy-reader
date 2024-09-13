#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod handler;
mod setup;

fn main() {
    cozy_reader_lib::run()
}
