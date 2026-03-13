"use client";

import { use } from "react";
import dynamic from "next/dynamic";

const BoardContent = dynamic(() => import("./BoardContent"), { ssr: false });

export default function BoardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <BoardContent slug={slug} />;
}
