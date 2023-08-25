export const copyContent = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    console.log("Content copied to clipboard");
  } catch (error) {
    console.error("Failed to copy: ", error);
  }
};
