require('dotenv').config();
const {wallets} = require('../wallets/addresses.js')
const CONTRACT_PLAYER_ADDRESS = "0xb00ed7e3671af2675c551a1c26ffdcc5b425359b"
const CONTRACT_GAME_ADDRESS = "0xccc78df56470b70cb901fcc324a8fbbe8ab5304b"
const ethers = require('ethers')
const abi_player = require("../abis/bsw-nft-player.json")
const abi_game = require("../abis/bsw-game.json");

// https://bsc-dataseed.binance.org
const provider = new ethers.providers.StaticJsonRpcProvider("https://rpc.ankr.com/bsc")
let contractPlayer = new ethers.Contract(CONTRACT_PLAYER_ADDRESS, abi_player, provider)
const GAME1 = 0;
const GAME2 = 1;
const GAME3 = 2;
const GAME4 = 3;
const GAME5 = 4;
const GAME6 = 5;
const GAME7 = 6;
/**
 * 请先在wallets文件夹的addresses中配置钱包信息，然后下面的go()函数中配置自己的游戏组合
 */
function go() {
    /**
     * 示例1：使用钱包地址 0xxxxxxxxxxxxxxxxxxxxx 打1级游戏，参与的队伍总共4队
     * 队伍1: [174770, 163717] 2人组成一队，满1000能量
     * 队伍2: [58237] 1人组成一队，满1000能量
     * 队伍3: [174771,1747,174722] 3人组成一队，满1000能量
     * 
     * 请替换成自己对应钱包地址拥有的Player的编号
     */
    playGame('0xxxxxxxxxxxxxxxxxxxxx', GAME1, [
        [174770, 163717], 
        [58237], 
        [174771,1747,174722]
    ])
    /**
     * 示例1：使用钱包地址 0xxxxxxxxxxxxxxxxxxxxx 打2级游戏，参与的队伍总共2队
     * 队伍1: [4444, 333,99922] 3人组成1队，满2000能量
     * 队伍2: [583337] 1人组成一队，满2000能量
     * 
     * 请替换成自己对应钱包地址拥有的Player的编号
     */
    playGame('0xC8ad60a96912A2c5b4A984371a0208d814Fb4bC1', GAME2, [
        [4444, 333,99922], [583337]
    ])
}

async function playGame(from, gameIndex, rounds) {
    let tempWallet = new ethers.Wallet(wallets[from], provider)
    let tempContractGame = new ethers.Contract(CONTRACT_GAME_ADDRESS, abi_game, tempWallet)
    // console.log(nonce)
    for(let i = 0; i < rounds.length; i++) {
        let go = true;
        let totalSquidEnergy = 0
        for(let j = 0; j < rounds[i].length; j++) {
            let player;
            try{
                player = await contractPlayer.getToken(rounds[i][j])
            } catch(e) {
                console.log(`Get Token ${rounds[i][j]} Error`)
                continue
            }
            let now = parseInt((new Date().valueOf() / 1000))
            // console.log(player.busyTo)
            // console.log(player.contractEndTimestamp)
            if(!(player.busyTo < now && player.contractEndTimestamp > now)) {
               
                go = false
                console.log(`[` + rounds[i].join(',') +  `] 未能参加比赛`)
                break;
            } else {
                let squidEnergy = Number(ethers.utils.formatUnits(player.squidEnergy.toString()))
                totalSquidEnergy += squidEnergy
            }
        }
        switch(gameIndex) {
            case 0:
                if(totalSquidEnergy < 100) {
                    go = false
                }
                break;
            case 1:
                if(totalSquidEnergy < 2000) {
                    go = false
                }
                break;
            case 2:
                if(totalSquidEnergy < 3000) {
                    go = false
                }
                break;
            case 3:
                if(totalSquidEnergy < 4000) {
                    go = false
                }
                break;
            case 4:
                if(totalSquidEnergy < 5000) {
                    go = false
                }
                break;
            case 5:
                if(totalSquidEnergy < 6000) {
                    go = false
                }
                break;
            case 6:
                if(totalSquidEnergy < 7000) {
                    go = false
                }
                break;
            default:
                throw 'NOT SUPPORT'
        }
        if(go) {
            await tempContractGame.estimateGas.playGame(gameIndex, rounds[i], 1)
            let date = new Date()
            let now = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
            console.log(now)
            console.log(`[` + rounds[i].join(',') +  `] 开始参加比赛`)
            await tempContractGame.playGame(gameIndex, rounds[i], 1, {gasLimit: 500000, gasPrice: ethers.utils.parseUnits("5", 'gwei')})
            console.log(`[` + rounds[i].join(',') + `] 结束参加比赛`)
        }
    }
    // console.log(`${from}完成游戏.`)
}

go()
setInterval(() => {
    console.log(new Date().valueOf())
    go()
}, 2 * 60 * 1000)
