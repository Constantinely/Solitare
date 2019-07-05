'use strict';


document.getElementById("newGameBut").onclick=function(){
    location.reload();
}

var isGameStarted=false;
var cardsFolder="images/cards/";
var bgImgSrc="images/card-back.png"
var isCardOnMouse=false;
var finishedCards=0;
var cardsOnMouse=new Array();
var playFields=new Array();
var finaFields=new Array();
var mainDeck=new MainDeck('mainDeck',0);
var dealedCards=new DeledCardField('dealedCards',0);
makePlayFields();
makeFinalFields();
var srcsArray=loadCardsSrc();
for(let i=0;i<srcsArray.length;i++){
    new Card(srcsArray[i].type,srcsArray[i].number,mainDeck);
}

dealCards();

function dealCards()
{
    for(let i=0;i<7;i++){
        for(let j=0;j<=i;j++){
            mainDeck.cardArr[mainDeck.cardArr.length-1].moveTo(playFields[i]);
            playFields[i].cardArr[playFields[i].cardArr.length-1].setSide('back');
        };
        playFields[i].cardArr[i].setSide('front');
    };
    isGameStarted=true;
}


function Card(newCardType,newCardNumber,parentField)
{
    var image=new Image();
    image.style.position="absolute";
    var side='back';
    var cardNumber=newCardNumber;
    var cardType=newCardType;
    var cardColor;
    switch (cardType){
        case 'c':cardColor='black';break;
        case 's':cardColor='black';break;
        case 'd':cardColor='red';break;
        case 'h':cardColor='red';break;
    }
    let tempCardNumber=newCardNumber;
    if(tempCardNumber<10)tempCardNumber='0'+tempCardNumber;
    var frontImgSrc=cardsFolder+cardType+tempCardNumber+".png";
    image.src=bgImgSrc;

    this.getCardColor=function(){
        return cardColor;
    }

    this.getCardNumber=function(){
        return cardNumber;
    }

    this.getCardType=function(){
        return cardType;
    }

    parentField.div.appendChild(image);
    parentField.cardArr.push(this);
    image.style.top=parentField.getCoords().top;
    image.style.left=parentField.getCoords().left;

    this.moveTo=function(newParentField){
        parentField.cardArr.pop();
        parentField=newParentField;
        parentField.div.appendChild(image);
        parentField.cardArr.push(this);
        image.style.top=newParentField.getCoords().top+newParentField.getVerticalSpace()*(newParentField.cardArr.length-1);
        image.style.left=newParentField.getCoords().left;
        if(parentField instanceof MainDeck)image.src=bgImgSrc;
        else image.src=frontImgSrc;
    };

    this.setBorder=function(borderValue){
        if(borderValue==1)image.style.border="3px dashed blue";
        else image.style.border=null;
    };

    this.getCoords=function(){
        return{
            left:image.style.left,
            top:image.style.top
        };
    };   

    this.setSide=function(newSide){
        if(newSide=='back')image.src=bgImgSrc;
        else if(newSide=='front')image.src=frontImgSrc;
        side=newSide;
    };

    image.onclick=function(e){
        if(parentField instanceof MainDeck)return;
        if(parentField instanceof FinalField)return; 
        if(side=='back'&&parentField.cardArr[parentField.cardArr.length-1]!=this)
            return;
        if(side=='back'&&parentField.cardArr[parentField.cardArr.length-1]==this){
            this.setSide('front');
            return;
        }; 
        if(isCardOnMouse)return;    
        cardsOnMouse=[];
        isCardOnMouse=true;
        for(let i=parentField.cardArr.indexOf(this);i<parentField.cardArr.length;i++){
            cardsOnMouse.push(parentField.cardArr[i]);
        }
        cardsOnMouse.forEach(element => {
            element.setBorder(1);
        });
        e.stopPropagation();
    }.bind(this);

    this.getImage=function(){
        return image;
    }
};


function Field(fieldId,startVerticalSpace)
{
    var verticalSpace=startVerticalSpace;
    this.getVerticalSpace=function(){
        return verticalSpace;
    };
    this.div=document.getElementById(fieldId);
    this.getCoords=function(){
        let box=this.div.getBoundingClientRect();
        return {
            top: box.top + pageYOffset,
            left: box.left + pageXOffset
        };
    }.bind(this);
    this.cardArr=new Array();
};

function MainDeck(fieldId,startVerticalSpace)
{
    Field.apply(this,arguments);

    this.div.onclick=function(){
        if(this.cardArr.length==0){
            restartDeck();
            return;
        };
        this.cardArr[this.cardArr.length-1].moveTo(dealedCards);
    }.bind(this);

    var restartDeck=function(){
        for(let i=dealedCards.cardArr.length-1;i>=0;i--)
            dealedCards.cardArr[i].moveTo(this);
    }.bind(this);
};


function DeledCardField(fieldId,startVerticalSpace)
{
    Field.apply(this,arguments);

    this.div.onclick=function(e){
        if(isCardOnMouse&&this.cardArr.indexOf(cardsOnMouse[0])!=-1){
            cardsOnMouse.forEach(element => {
                element.setBorder(0);
            });
            cardsOnMouse=[];
            isCardOnMouse=false;
            return;
        };
        if(isCardOnMouse)
            return;
        this.cardArr[this.cardArr.length-1].getImage().dispatchEvent(new Event("click"));
    }.bind(this);    
}

function PlayField(fieldId,startVerticalSpace)
{
    Field.apply(this,arguments); 

    this.canAdd=function(){
        if(!isGameStarted)return true;
        if(this.cardArr.length==0&&cardsOnMouse[0].getCardNumber()==13)return true;
        if(this.cardArr.length==0)return false;
        if(cardsOnMouse[0].getCardColor()!=this.cardArr[this.cardArr.length-1].getCardColor()){
            if(cardsOnMouse[0].getCardNumber()<this.cardArr[this.cardArr.length-1].getCardNumber())return true;
        }
        return false;
    }.bind(this);

    this.div.onclick=function(){
        if(isCardOnMouse&&this.cardArr.indexOf(cardsOnMouse[0])!=-1){
            cardsOnMouse.forEach(element => {
                element.setBorder(0);
            });
            cardsOnMouse=[];
            isCardOnMouse=false;
            return;
        };
        if(isCardOnMouse&&this.canAdd()){
            for(let i=0;i<cardsOnMouse.length;i++){
                cardsOnMouse[i].moveTo(this);
                cardsOnMouse[i].setBorder(0);
            };
            isCardOnMouse=false;
            console.log(isCardOnMouse);
            cardsOnMouse=[];
        };
    }.bind(this);    
};

function FinalField(fieldId,startVerticalSpace)
{
    Field.apply(this,arguments);
    this.div.onclick=null;
    var fieldType=undefined;
    var canAdd=function(){
        if(this.cardArr.length==0&&cardsOnMouse.length==1&&cardsOnMouse[0].getCardNumber()==1){
            fieldType=cardsOnMouse[0].getCardType();
            return true;
        };
        if(this.cardArr.length==cardsOnMouse[0].getCardNumber()-1&&cardsOnMouse[0].getCardType()==fieldType)return true;
        return false;
    }.bind(this);
    this.div.onclick=function(){
        if(!isCardOnMouse)return;
        if(isCardOnMouse&&canAdd()){           
            cardsOnMouse[0].moveTo(this);
            cardsOnMouse[0].setBorder(0);            
            isCardOnMouse=false; 
            cardsOnMouse=[];
            finishedCards++;
            console.log(finishedCards);
            if(finishedCards==52)alert("Вы победили!!!!");
        };
    }.bind(this);
}

function makePlayFields()
{
    for(let i=1;i<=7;i++)
        playFields.push(new PlayField('field'+i+'play',25));
}

function makeFinalFields()
{
    for(let i=1;i<=4;i++)
        finaFields.push(new FinalField("finalField"+i,0));
}

function loadCardsSrc()
{
    var arr=new Array();
    for(let i=1;i<=13;i++)
    {
        arr.push({type:'c',number:i});
        arr.push({type:'s',number:i});
        arr.push({type:'h',number:i});
        arr.push({type:'d',number:i});
    }
    arr=arr.sort(function(){
        return Math.random() - 0.5;
    })
    return arr;
};