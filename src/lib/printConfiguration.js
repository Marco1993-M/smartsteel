// Decode the captured frame before print media hides the live WebGL canvas.
export async function printConfiguration(scene, image) {
  const canvas = scene.current?.querySelector('canvas')
  if (!canvas?.width || !canvas.height) {
    throw new Error('Open the 3D view and wait for it to load before saving the PDF.')
  }

  image.current.src = canvas.toDataURL('image/png')
  await image.current.decode()
  window.print()
}
