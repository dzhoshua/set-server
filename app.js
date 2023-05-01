const express = require('express');
const port = 3000;
const app = express();
const randtoken = require('rand-token');
app.use(express.json());

let users=[]
let deck=[]///колода из 81 карты
let cards=[]///карты на столе

////генерация карт
let id=1
for(let count=1;count<4;count++){
    for(let fill=1;fill<4;fill++){
        for(let shape=1;shape<4;shape++){
            for(let color=1;color<4;color++){
                deck.push({
                    "id":id++,"count": count, "fill": fill, "shape": shape, "color": color
                })
            }
        }
    }
}
function shuffle(array) {
    let currentIndex = array.length,  randomIndex
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]]
    }
    return array
  }

shuffle(deck)
cards=deck.splice(0,12)
// console.log("deck.length=",deck.length, "cards:",cards)
 
///проверка токена
function isSetToken(token){
    if(token==''){
        return false
    }
    if(users.length==0){
        return false
    }
    else{
        for(let i=0;i<users.length;i++){
            if(users[i].token === token){
                return true
            }
        } 
        return false
    }
}

///проверка ввода сета карт
function inputCheker(set){
    if(Array.isArray(set)){
        if(set.length==3){
            for(let i=0;i<set.length;i++){
                if(Number.isInteger(set[i])===false){
                    return false
                }
            }
            return true
        }
        else{
            return false
        }
    }else{
        return false
    }
}

function areAllEqual(i,j,k){
    return i===j && j===k
}
function areAllDifferent(i,j,k){
    return i!==j && j!==k && i !== k
}

function isValidSet(cards, i,j,k){
    if(!areAllEqual(cards[i].count, cards[j].count, cards[k].count) 
        && !areAllDifferent(cards[i].count, cards[j].count, cards[k].count)){
			return false
		}
	if(!areAllEqual(cards[i].fill, cards[j].fill, cards[k].fill)
         && !areAllDifferent(cards[i].fill, cards[j].fill, cards[k].fill)){
			return false
		}
	if(!areAllEqual(cards[i].shape, cards[j].shape, cards[k].shape)
        && !areAllDifferent(cards[i].shape, cards[j].shape, cards[k].shape)){
			return false
		}
	if(!areAllEqual(cards[i].color, cards[j].color, cards[k].color)
         && !areAllDifferent(cards[i].color, cards[j].color, cards[k].color)){
			return false
		}
	return true
}

function findSetByIndex(){
    let arr=[]
    for(let i=0;i<cards.length-2;i++){
        for(let j=i+1;j<cards.length-1;j++){
            for(let k=j+1;k<cards.length;k++){
                if(isValidSet(cards,i,j,k)){
                    arr.push([i,j,k])
                }
            }
        }
    }
    return arr //////индексы карт, не айди
}

function findId(indexes){
    let arr=[]
    for(let i=0;i<indexes.length;i++){
        let ids=[]
        ids.push(cards[indexes[i][0]].id, cards[indexes[i][1]].id, cards[indexes[i][2]].id)
        ids.sort(function(a, b) {return a - b})
        arr.push(ids)
    }
    return arr
}

function findIndex(ids){
    let res=[]
    for(let i=0;i<cards.length;i++){
        for(let j=i+1;j<cards.length;j++){
            for(let k=j+1;k<cards.length;k++){
                if(
                    (ids[0]==cards[i].id && ids[1]==cards[j].id && ids[2]==cards[k].id)||
                    (ids[0]==cards[i].id && ids[2]==cards[j].id && ids[1]==cards[k].id)||
                    (ids[1]==cards[i].id && ids[0]==cards[j].id && ids[2]==cards[k].id)||
                    (ids[1]==cards[i].id && ids[2]==cards[j].id && ids[0]==cards[k].id)||
                    (ids[2]==cards[i].id && ids[1]==cards[j].id && ids[0]==cards[k].id)||
                    (ids[2]==cards[i].id && ids[0]==cards[j].id && ids[1]==cards[k].id)
                    ){
                    res.push(i,j,k)
                }
            }
        }
    }
    return res
}

function isSet(set, sets_in_cards){
    set.sort(function(a, b) {return a - b})
    //console.log("set ", set)
    for(let i=0;i<sets_in_cards.length;i++){
        if(set[0]==sets_in_cards[i][0] && set[1]==sets_in_cards[i][1] && set[2]==sets_in_cards[i][2]){
            return true
        }
    }
    return false
}

function delAndPushCards(set){
    indexes=findIndex(set)
    cards.splice(indexes[0], 1)
    cards.splice(indexes[1]-1, 1)
    cards.splice(indexes[2]-2, 1)
    if(cards.length==0){
        return false
    }
    if(deck.length!=0){
        cards.push(deck.shift())
        cards.push(deck.shift())
        cards.push(deck.shift())
    }
    //console.log("deck.length ", deck.length)
    return true
}

app.post('/user/register', async(req, res) => {
    try{
        const nickname=req.body.nickname
        const password=req.body.password
        if(nickname==''||password==''){
            res.json({ "success": false, "exception": { "message": "Nickname or password is incorrect" }})
            return
        }
        if(users.length>=1){
            for(let i=0;i<users.length;i++){
                if(users[i].nickname === nickname){
                    res.json({"success": false, "exception": {"message": "Nickname is already in use"}})
                    return
                }
            } 
        }
        const token= randtoken.generate(16)
        let user={nickname:nickname, token:token, score:0}
        users.push(user)
        res.json({ "success": true, "exception": null, nickname:nickname, token: token})
    }
    catch(err){
        res.status(500).json({ "status": "error_registration"})
    }
  })
  

  app.post('/set/field', async(req, res) => {
    try{
        const token=req.body.accessToken
        if(isSetToken(token)){
            res.json({ "success": true, "exception": null, "cards":cards})
        }else{
            res.json({ "success": false, "exception": {"message": "Token is incorrect"}})
        }

    }
    catch(err){
        res.status(500).json({"status": "error_field"})
    }
})

app.post('/set/pick', async(req, res) => {
    try{
        const token=req.body.accessToken
        const set=req.body.cards
        let is_set
        let score
        if(isSetToken(token)){
            if(!inputCheker(set)){
                res.json({"success": false, "exception": {"message": "Input error"}})
                return
            }
            let sets_in_cards_by_index = findSetByIndex()
            let sets_in_cards = findId(sets_in_cards_by_index)
            //console.log("sets_in_cards ", sets_in_cards)

            ///если сетов в массиве sets_in_cards нет, то:
            if(sets_in_cards.length==0){
                res.json({ "status":"Game Over!"})
                return
            }

            if(isSet(set, sets_in_cards)){
                is_set=true
                for(let i=0;i<users.length;i++){
                    if(users[i].token === token){
                        users[i].score = users[i].score+1
                        score = users[i].score
                    }
                }
                if(!delAndPushCards(set)){
                    res.json({"status":"Game Over."})
                }
            }
            else{
                is_set=false
                for(let i=0;i<users.length;i++){
                    if(users[i].token === token){
                        score = users[i].score
                    }
                }
            }
            res.json({"success": true, "exception": null, "isSet":is_set, "score":score})
        }else{
            res.json({"success": false, "exception": {"message": "Token is incorrect"}})
        }
    }
    catch(err){
        res.status(500).json({"status": "error_pick"})
    }
})

app.post('/set/score', async(req, res) => {
    try{
        const token=req.body.accessToken
        if(isSetToken(token)){
            let users_copy=[]
            for(let i=0;i<users.length;i++){
                users_copy.push({ "nickname": users[i].nickname, "score": users[i].score})
            }
            res.json({"success": true, "exception": null, "users":users_copy})
        }else{
            res.json({"success": false, "exception": {"message": "Token is incorrect"}})
        }
    }
    catch(err){
        res.status(500).json({"status": "error_score"})
    }
})

  app.listen(port, () => console.log('Set-Game app is listening on port 3000.'));
