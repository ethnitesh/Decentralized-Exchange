import {Exchange_Contract_ABI,
    Exchange_Contract_Address,
    CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS,
    CRYPTO_DEV_TOKEN_CONTRACT_ABI} from "../constants";
import { Contract,utils } from "ethers";

const addliquidity = async(signer, addCDamountWei, addEtherAmountWei) => {
try {
    const tokenContract =new Contract(CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS,
        CRYPTO_DEV_TOKEN_CONTRACT_ABI,signer);
    const exchangeContract = new Contract (Exchange_Contract_Address,Exchange_Contract_ABI,signer);
     
    let tx = await tokenContract.approve(Exchange_Contract_Address, addCDamountWei.toString());
    await tx.wait();
    
    tx = await exchangeContract.addliquidity(addCDamountWei,{value: addEtherAmountWei,});
    await tx.wait();

} catch (error) {
    console.error("addliquidity", error);
}
}

const calculateCD = async (_addEther="0", etherBalanceContract, cdTokenReserve) => {
    try {
        const _addEtherAmountWei = utils.parseEther(_addEther);
        const cryptoDevTokenAmount = _addEtherAmountWei.mul(cdTokenReserve).div(etherBalanceContract);
        return cryptoDevTokenAmount;
        
    } catch (error) {
        console.error("calculateCD",error);
    }
}

module.exports={addliquidity,calculateCD}