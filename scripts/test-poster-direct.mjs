// 临时验证：自动化上传场景（直接传 title/content，不依赖 poemId）
const res = await fetch("http://localhost:3000/api/v1/poster", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "静夜思",
    content: "床前明月光，疑是地上霜。举头望明月，低头思故乡。",
    author: "李白",
    dynasty: "唐",
    theme: "night",
    format: "svg",
  }),
});
const json = await res.json();
console.log(
  JSON.stringify({
    ok: json.success,
    title: json.data?.title,
    svgLen: json.data?.svg?.length,
    width: json.data?.width,
    height: json.data?.height,
    msg: json.message,
  })
);
