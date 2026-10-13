from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.lib.utils import ImageReader
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/pdf/atlas-warehouse-system-overview.pdf'
W,H=595.276,841.89
c=canvas.Canvas(str(OUT),pagesize=(W,H))
c.setTitle('Atlas W-Series | Warehouse System Overview')
c.setAuthor('Smart Steel')
NAVY='#001D2E'; BLUE='#0043F3'; GRAY='#526570'; MIST='#C1D9E5'; WASH='#F3F7F9'
def rect(x,y,w,h,col):
 c.setFillColor(HexColor(col));c.rect(x,y,w,h,fill=1,stroke=0)
def text(s,x,y,size=10,col=NAVY,bold=False):
 c.setFillColor(HexColor(col));c.setFont('Helvetica-Bold' if bold else 'Helvetica',size);c.drawString(x,y,s)
def para(s,x,top,w,size=11,col=GRAY,bold=False):
 p=Paragraph(s,ParagraphStyle('p',fontName='Helvetica-Bold' if bold else 'Helvetica',fontSize=size,leading=size*1.45,textColor=HexColor(col)))
 _,h=p.wrap(w,700);p.drawOn(c,x,top-h);return h

def base(n,label,title,intro):
 rect(0,0,W,H,'#FFFFFF');rect(0,H-91,W,91,NAVY)
 img=ImageReader(str(ROOT/'public/atlas/atlas-logo-horizontal-light.png'));iw,ih=img.getSize()
 c.drawImage(img,40,H-66,width=175,height=175*ih/iw,mask='auto')
 text('W-SERIES / SYSTEM OVERVIEW',344,H-49,8,MIST)
 text(label,40,716,9,BLUE,True)
 para(title,40,697,515,29,NAVY,True)
 para(intro,40,611,515,11)
 rect(40,45,515,0.6,MIST)
 text('ATLAS SYSTEM  /  DEVELOPED BY SMART STEEL',40,29,7,GRAY)
 text(f'{n:02}',539,29,8,NAVY,True)

def row(y,code,title,body):
 text(code,40,y-3,17,BLUE,True)
 text(title,88,y,13,NAVY,True)
 para(body,88,y-12,460,10.5)

# Cover: original artwork preserved at full page, with title in its open upper area.
c.drawImage(str(ROOT/'public/Atlas_warehouses_w08_spec_sheet.png'),0,0,width=W,height=H)
para('Warehouse System<br/>Overview',45,758,510,36,NAVY,True)
para('Storage. Workshops. Agriculture. Commercial Space',47,635,490,12,GRAY)
c.showPage()

base(2,'01 / THE SYSTEM','A practical approach\nto warehouse space.'.replace('\n','<br/>'),'Atlas W-Series is Smart Steel\'s modular warehouse system. Cold-formed lipped channel steel, repeatable bays and bolted connections create a configurable starting point for your building.')
rect(40,473,515,70,NAVY)
for x,a,b in [(55,'MODULAR','REPEATABLE BAYS'),(225,'BOLTED','SITE ASSEMBLY'),(397,'CONFIGURABLE','WIDTH + LENGTH')]:
 text(a,x,514,13,'#FFFFFF',True);text(b,x,492,8,MIST)
row(443,'01','Choose your footprint','Select a warehouse width and configure the length in 4m bay increments to suit your space, access and operational needs.')
row(365,'02','Configure the building shell','Start with the steel frame, add roof sheeting, or select an enclosed shell. Openings and finishes are confirmed for your project.')
row(287,'03','Assemble a defined steel system','The frame brings together columns, roof members, purlins, side rails and bracing with bolted connections. Your final component schedule defines the supply.')
rect(40,89,515,104,WASH)
text('SPACE WITH A PURPOSE',55,170,9,BLUE,True)
para('Stock and material storage  /  Workshops and service areas<br/>Farm equipment and agricultural storage  /  Covered work areas<br/>Depots and commercial support space',55,153,480,11,NAVY)
c.showPage()

base(3,'02 / YOUR CONFIGURATION','Choose the size.<br/>Then choose the scope.','Match the footprint and level of enclosure to the way you intend to use the building. Final dimensions, finishes and openings are confirmed during project review.')
text('WAREHOUSE WIDTHS',40,544,9,BLUE,True)
for i,(code,span) in enumerate([('W06','6m'),('W08','8m'),('W10','10m'),('W12','12m')]):
 x=40+i*131
 rect(x,451,122,74,WASH);text(code,x+12,498,21,NAVY,True);text(span+' span',x+12,474,11,GRAY)
para('<b>Length:</b> configured in 4m bays. For example, an 8m x 20m footprint provides 160m² of floor area.<br/><b>Height:</b> selected around your access and operating needs, subject to technical review.',40,434,515,10.5)
text('SHEETING & ENCLOSURE OPTIONS',40,354,9,BLUE,True)
options=[('Structure only','Steel frame without roof or wall sheeting.'),('Roof-sheeted','Steel frame with roof sheeting for covered space.'),('Roof + side walls','Roof and side-wall sheeting, with gables left open.'),('Enclosed shell','Roof, side walls and gables sheeted; openings agreed separately.')]
y=329
for a,b in options:
 text(a,40,y,11,NAVY,True);para(b,191,y+3,360,10)
 rect(40,y-29,515,.5,MIST);y-=48
text('FINISHES & ACCESS',40,119,9,BLUE,True)
para('Discuss ZAM, galvanised or mild-steel frame options, sheeting finishes, vehicle access and pedestrian openings with Smart Steel. Suitability and supplied items are confirmed in your quotation.',40,106,515,10)
c.showPage()

base(4,'03 / YOUR PROJECT','From your brief<br/>to a defined supply.','Start with the space you need. Smart Steel will help turn your preferred configuration into a reviewed scope and a project-specific quotation.')
steps=[('01','Share your brief','Tell us the site location, intended use, preferred width and length, required height and access needs.'),('02','Review your configuration','Agree the frame finish, sheeting, openings and any delivery or installation requirements. Confirm site and engineering requirements.'),('03','Confirm the quotation','Review the dimensions, component schedule, inclusions, exclusions and programme before placing your order.')]
y=542
for a,b,d in steps:
 row(y,a,b,d);y-=79
rect(40,191,515,104,WASH)
text('PLAN THE COMPLETE PROJECT',55,274,9,BLUE,True)
para('Foundations, floor slabs, site works, approvals and professional services must be allowed for separately unless expressly included. Delivery, installation, doors and accessories are included only where listed in the quotation.',55,261,483,10)
rect(40,78,515,93,NAVY)
text('Let\'s configure your warehouse.',55,147,19,'#FFFFFF',True)
text('www.smartsteel.co.za/warehouse-builder',55,122,11,'#FFFFFF')
c.linkURL('https://www.smartsteel.co.za/warehouse-builder',(55,116,410,133),relative=0)
text('Enquiries: +27 82 657 6522',55,100,10,MIST)
c.linkURL('tel:+27826576522',(55,94,245,109),relative=0)
c.showPage();c.save()
print(OUT)
