import { open } from "@tauri-apps/plugin-dialog";

// 弹出文件夹选择对话框
export async function askOpenFolder() {
  const selected = await open({
    directory: true,
    multiple: true,
  });

  if (selected === null) {
    return [];
  } else if (!Array.isArray(selected)) {
    return [selected];
  }

  return selected;
}

export async function askOpenImg() {
  const selected = await open({
    filters: [
      {
        name: "Images",
        extensions: ["jpg", "png", "gif", "jpeg", "ico", "icon", "svg", "webp"],
      },
    ],
  });
  console.log("askOpenImg", selected);
  return selected;
}

export async function askOpenFiles(
  extensions: string[] = ["*"],
  name = "All Files",
  multiple = false
) {
  const selected = await open({
    filters: [
      {
        name: name,
        extensions: extensions,
        multiple: multiple,
      },
    ],
  });
  console.log("askOpenFiles with extensions", extensions, selected);
  return selected;
}
