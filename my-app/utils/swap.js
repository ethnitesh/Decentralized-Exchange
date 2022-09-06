import{Contract} from "ethers";
import {Exchange_Contract_ABI,
    Exchange_Contract_Address,
    CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS,
    CRYPTO_DEV_TOKEN_CONTRACT_ABI} from "../constants"

const getAmountOfTokensReceivedFromSwap = async (_swapAmountWei, provider, ethSelected, ethBalance, reservedCD ) => {
    const exchangeContract = new Contract(Exchange_Contract_Address, Exchange_Contract_ABI, provider);
    let amountOfTokens;
    if (ethSelected) {
        amountOfTokens = await exchangeContract.getAmountOfTokens(
            _swapAmountWei,ethBalance,reservedCD
        );
    } else{
        amountOfTokens = await exchangeContract.getAmountOfTokens(
            _swapAmountWei,reservedCD,ethBalance
        );
    }
    return amountOfTokens;
}

const swapTokens = async(signer, swapAmountWei, tokenToBeReceivedAfterSwap, ethSelected) =>  {
    const exchangeContract = new Contract(Exchange_Contract_Address, Exchange_Contract_ABI, signer);
    const tokenContract = new Contract (CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS,
        CRYPTO_DEV_TOKEN_CONTRACT_ABI,signer);
        let tx;
        if(ethSelected){
            tx = await exchangeContract.ethToCryptoDevToken(tokenToBeReceivedAfterSwap,{
                value: swapAmountWei,
            });
        }else{
            tx= await tokenContract.approve(Exchange_Contract_Address,swapAmountWei.toString());
            await tx.wait();
            tx = await exchangeContract.cryptoDevTokenToEth(swapAmountWei,tokenToBeReceivedAfterSwap);
        }
}

module.exports={getAmountOfTokensReceivedFromSwap,swapTokens};