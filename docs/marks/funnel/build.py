import sys, json, uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
path, wght, track = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
data = open(path, "rb").read()
face = hb.Face(data); font = hb.Font(face); font.set_variations({"wght": wght})
tt = TTFont(path); upem = tt["head"].unitsPerEm
gs = tt.getGlyphSet(location={"wght": wght})
order = tt.getGlyphOrder()
def run(text):
    buf = hb.Buffer(); buf.add_str(text); buf.guess_segment_properties()
    hb.shape(font, buf, {"kern": True, "liga": False})
    return buf.glyph_infos, buf.glyph_positions
out = {}
x = 0.0
for word in ("leader", "sheet"):
    infos, pos = run(word)
    pen = SVGPathPen(gs)
    start = x
    for i, (inf, p) in enumerate(zip(infos, pos)):
        name = order[inf.codepoint]
        tp = TransformPen(pen, (1, 0, 0, -1, x + p.x_offset, 0))
        gs[name].draw(tp)
        x += p.x_advance + track * upem
    out[word] = dict(d=pen.getCommands(), x0=start, x1=x - track * upem)
    pass
os2 = tt["OS/2"]
out.update(upem=upem, xh=os2.sxHeight, cap=os2.sCapHeight, asc=tt["hhea"].ascent, desc=tt["hhea"].descent)
json.dump(out, open("outline.json", "w"))
print({k: v for k, v in out.items() if k not in ("leader", "sheet")}, out["leader"]["x0"], out["leader"]["x1"], out["sheet"]["x0"], out["sheet"]["x1"])
