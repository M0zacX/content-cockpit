"use client";

const folders = [
  { name: "Carousel-Posts", count: 19, type: "BEST CONTENT", typeClass: "bg-accent/15 text-accent", desc: "Best shots - portraits, food, scenic, lifestyle" },
  { name: "Stories", count: 25, type: "STORIES", typeClass: "bg-purple/15 text-purple", desc: "Casual moments, behind-the-scenes, quick snaps" },
  { name: "Reels-Clips", count: 23, type: "VIDEO", typeClass: "bg-orange/15 text-orange", desc: "All MP4 + MOV video files for reels" },
  { name: "Skip", count: 33, type: "SKIP", typeClass: "bg-text2/15 text-text2", desc: "Duplicates, blurry, rotated, low quality" },
];

const photos = [
  { num: 1, name: "01-portrait-thai-wooden-house-golden-hour", tag: "Hero", tagClass: "bg-accent/15 text-accent" },
  { num: 2, name: "02-traditional-thai-house-lanterns", tag: "Scenic", tagClass: "bg-green/15 text-green" },
  { num: 3, name: "03-lush-garden-path-wooden-house", tag: "Scenic", tagClass: "bg-green/15 text-green" },
  { num: 4, name: "04-colorful-lanterns-garden", tag: "Scenic", tagClass: "bg-green/15 text-green" },
  { num: 5, name: "05-lantern-pathway-serene", tag: "Scenic", tagClass: "bg-green/15 text-green" },
  { num: 6, name: "06-wooden-cafe-terrace", tag: "Lifestyle", tagClass: "bg-purple/15 text-purple" },
  { num: 7, name: "07-aesthetic-cafe-entrance-ferns", tag: "Lifestyle", tagClass: "bg-purple/15 text-purple" },
  { num: 8, name: "08-mango-sticky-rice-classic", tag: "Food", tagClass: "bg-orange/15 text-orange" },
  { num: 9, name: "09-tropical-fruit-platter-colorful", tag: "Food", tagClass: "bg-orange/15 text-orange" },
  { num: 10, name: "10-thai-fried-rice-plate", tag: "Food", tagClass: "bg-orange/15 text-orange" },
  { num: 11, name: "11-giant-christmas-tree-maya-mall", tag: "Hero", tagClass: "bg-accent/15 text-accent" },
  { num: 12, name: "12-boat-ride-pattaya-skyline", tag: "Hero", tagClass: "bg-accent/15 text-accent" },
  { num: 13, name: "13-hotel-towel-art-flower", tag: "Lifestyle", tagClass: "bg-purple/15 text-purple" },
  { num: 14, name: "14-christmas-tree-white-cat", tag: "Lifestyle", tagClass: "bg-purple/15 text-purple" },
  { num: 15, name: "15-tuk-tuk-ride-purple-neon", tag: "Hero", tagClass: "bg-accent/15 text-accent" },
  { num: 16, name: "16-born-to-be-wild-graffiti-neon", tag: "Lifestyle", tagClass: "bg-purple/15 text-purple" },
  { num: 17, name: "17-night-market-food-stalls", tag: "Food", tagClass: "bg-orange/15 text-orange" },
  { num: 18, name: "18-marble-kitchen-aesthetic", tag: "Lifestyle", tagClass: "bg-purple/15 text-purple" },
  { num: 19, name: "19-kitchen-garden-view", tag: "Lifestyle", tagClass: "bg-purple/15 text-purple" },
];

export default function PhotoLibrary() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold">Photo Library</h2>
        <p className="text-sm text-text2 mt-1">Your organized Thailand content, sorted and ready to post</p>
      </div>

      {/* Folders table */}
      <div className="border border-border rounded-lg overflow-hidden mb-8">
        <table>
          <thead>
            <tr>
              <th>Folder</th>
              <th>Files</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {folders.map((f) => (
              <tr key={f.name}>
                <td className="font-semibold">{f.name}</td>
                <td className="text-center font-bold">{f.count}</td>
                <td>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${f.typeClass}`}>
                    {f.type}
                  </span>
                </td>
                <td className="text-text2 text-sm">{f.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Carousel-Posts detail table */}
      <div className="mb-4">
        <h3 className="text-base font-bold mb-3">Carousel-Posts (Best Content)</h3>
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <table>
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th>Filename</th>
              <th className="w-24">Tag</th>
            </tr>
          </thead>
          <tbody>
            {photos.map((p) => (
              <tr key={p.num}>
                <td className="text-text2 text-center">{p.num}</td>
                <td className="font-mono text-sm">{p.name}</td>
                <td>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${p.tagClass}`}>
                    {p.tag}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
