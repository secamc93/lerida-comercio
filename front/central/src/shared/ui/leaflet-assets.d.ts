// Declaraciones para los assets de imagen que importa MapComponent.
// Leaflet expone PNGs internos que Next.js carga como módulos.
declare module 'leaflet/dist/images/marker-icon.png' {
  const src: string;
  export default src;
}

declare module 'leaflet/dist/images/marker-shadow.png' {
  const src: string;
  export default src;
}
