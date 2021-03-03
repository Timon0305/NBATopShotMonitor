export default function image(name: string) {
  return require(`../assets/images/${name}`).default;
}
