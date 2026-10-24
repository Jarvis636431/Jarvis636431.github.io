const walk = (node) => {
  if (node?.type === "code" && node.meta) {
    node.data ??= {};
    node.data.meta = node.meta;
  }
  node?.children?.forEach(walk);
};

/** Pass fenced-code metadata through Astro's highlighting pipeline. */
export default function remarkCodeMeta() {
  return (tree) => walk(tree);
}
