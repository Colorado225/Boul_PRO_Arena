export type Product={id:string;name:string;category:string;price:number;cost:number;stock:number;color:string};
export type CartLine={product:Product;qty:number};
export type Sale={id:string;time:string;amount:number;method:string;items:number};
export type Material={id:string;name:string;unit:string;quantity:number;minimum:number;price:number;trend:number};

export const products:Product[]=[
{id:'p1',name:'Baguette classique',category:'Pains',price:200,cost:126,stock:184,color:'#ead6a5'},
{id:'p2',name:'Pain complet',category:'Pains',price:350,cost:212,stock:62,color:'#bd875a'},
{id:'p3',name:'Croissant beurre',category:'Viennoiseries',price:500,cost:286,stock:38,color:'#edb84e'},
{id:'p4',name:'Pain chocolat',category:'Viennoiseries',price:600,cost:349,stock:26,color:'#8c5d3b'},
{id:'p5',name:'Chouquette',category:'Pâtisseries',price:250,cost:118,stock:74,color:'#f1d8aa'},
{id:'p6',name:'Tartelette coco',category:'Pâtisseries',price:750,cost:405,stock:18,color:'#d8ae76'},
{id:'p7',name:'Sandwich poulet',category:'Snacking',price:1500,cost:882,stock:21,color:'#8ebc70'},
{id:'p8',name:'Jus de bissap',category:'Boissons',price:500,cost:190,stock:45,color:'#8d3155'},
];
export const initialSales:Sale[]=[
{id:'V-2841',time:'10:42',amount:3850,method:'Wave',items:6},{id:'V-2840',time:'10:36',amount:2200,method:'Espèces',items:4},{id:'V-2839',time:'10:31',amount:7500,method:'Orange Money',items:9},{id:'V-2838',time:'10:18',amount:1750,method:'Espèces',items:5},
];
export const materials:Material[]=[
{id:'m1',name:'Farine T55',unit:'kg',quantity:842,minimum:300,price:500,trend:8.5},{id:'m2',name:'Sucre blanc',unit:'kg',quantity:126,minimum:80,price:780,trend:2.1},{id:'m3',name:'Levure boulangère',unit:'kg',quantity:9,minimum:12,price:4100,trend:4.8},{id:'m4',name:'Beurre',unit:'kg',quantity:38,minimum:25,price:5200,trend:-1.2},{id:'m5',name:'Sachets papier',unit:'unités',quantity:620,minimum:1000,price:35,trend:0},
];
export const revenueData=[{d:'Lun',v:228000},{d:'Mar',v:274000},{d:'Mer',v:251000},{d:'Jeu',v:318000},{d:'Ven',v:356000},{d:'Sam',v:412000},{d:'Dim',v:376000}];
export const fcfa=(v:number)=>new Intl.NumberFormat('fr-FR').format(v)+' F';
