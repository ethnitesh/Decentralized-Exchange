import { Contract, utils, providers, BigNumber } from "ethers";
import { Exchange_Contract_ABI, Exchange_Contract_Address } from "../constants"

const removeLiquidity = async (signer, removeLPTokenswei) => {
    const exchangeContract = new Contract(Exchange_Contract_Address, Exchange_Contract_ABI, signer);
    const tx = await exchangeContract.removeLiqidity(removeLPTokenswei);
    await tx.wait();
}

    const getTokensAfterRemove = async (provider, removeLPTokenswei, _ethBalance, cryptoDevTokenReserve) => {
        try {
            const exchangeContract = new Contract(Exchange_Contract_Address, Exchange_Contract_ABI, provider);
            const _totalSupply = await exchangeContract.totalSupply();
            const _removeEther = _ethBalance.mul(removeLPTokenswei).div(_totalSupply);
            const _removeCD = cryptoDevTokenReserve.mul(removeLPTokenswei).div(_totalSupply);
            return { _removeEther, _removeCD }
        } catch (error) {
            console.error("getTokensAfterRemove", error);
        }
    }

module.exports = { removeLiquidity, getTokensAfterRemove }