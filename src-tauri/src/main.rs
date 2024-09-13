#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod handler;
mod setup;
mod theme;

fn main() {
    cozy_reader_lib::run()
}
