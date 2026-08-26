export const videoProjects = [
  {
    index: "V01",
    slug: "yuehe-art-healing",
    title: "“月河”艺术疗愈短片",
    type: "AIGC MOTION · SHORT FILM",
    cover: "/videos/covers/yuehe-art-healing.webp",
    video: "/videos/yuehe-art-healing.mp4",
  },
  {
    index: "V02",
    slug: "tianjin-jizhou",
    title: "天津蓟州区家乡宣传短片",
    type: "CITY PROMO · EDITING",
    cover: "/videos/covers/tianjin-jizhou.webp",
    video: "/videos/tianjin-jizhou.mp4",
  },
  {
    index: "V03",
    slug: "huayang-1982-tvc",
    title: "“华洋1982”TVC短片",
    type: "TVC · PRODUCT FILM",
    cover: "/videos/covers/huayang-1982-tvc.webp",
    video: "/videos/huayang-1982-tvc.mp4",
  },
  {
    index: "V04",
    slug: "guardian-spirit-pearl",
    title: "“守护灵珠”动画短片",
    type: "ANIMATION · STORYTELLING",
    cover: "/videos/covers/guardian-spirit-pearl.webp",
    video: "/videos/guardian-spirit-pearl.mp4",
  },
  {
    index: "V05",
    slug: "skicat-ip-animation",
    title: "“滑雪猫”IP动画短片",
    type: "IP MOTION · CHARACTER",
    cover: "/videos/covers/skicat-ip-animation.webp",
    video: "/videos/skicat-ip-animation.mp4",
    fit: "contain",
  },
  {
    index: "V06",
    slug: "wuhu-motion-design",
    title: "“五虎祯祥”周边动效设计",
    type: "CULTURAL IP · MOTION",
    cover: "/videos/covers/wuhu-motion-design.webp",
    video: "/videos/wuhu-motion-design.mp4",
  },
] as const;

export type VideoProject = (typeof videoProjects)[number];
