import {
    Exchange_Contract_ABI,
    Exchange_Contract_Address,
    CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS,
    CRYPTO_DEV_TOKEN_CONTRACT_ABI
} from "../constants";
import { Contract } from "ethers";

const getEtherBalance = async (provider, address, contract = false) => {
    try {
        if (contract) {
            const balance = await provider.getBalance(Exchange_Contract_Address);
            return balance;
        } else {
            const balance = await provider.getBalance(address);
            return balance;
        }
    } catch (error) {
        console.error("getEtherBalance", error);
        return (0);
    }
}

const getCDTokensBalance = async (provider, address) => {
    try {
        const tokenContract = new Contract(CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS,
            CRYPTO_DEV_TOKEN_CONTRACT_ABI, provider);
        const balanceOfCryptoDevTokens = await tokenContract.balanceOf(address);
        return balanceOfCryptoDevTokens;
    } catch (error) {
        console.error("getCDTokensBalance", error);
    }
}


const getLPTokensBalance = async (provider, address) => {
    try {
        const exchangeContract = new Contract(Exchange_Contract_Address, Exchange_Contract_ABI, provider);
        const balanceOfLPTokens = await exchangeContract.balanceOf(address);
        return balanceOfLPTokens;
    } catch (error) {
        console.error("getLPTokensBalance", error);
    }
}

const getReserveofCDToken = async (provider) => {
    try {
        const exchangeContract = new Contract(Exchange_Contract_Address,Exchange_Contract_ABI, provider);
        const reserve = await exchangeContract.getReserve();
        return reserve;
    } catch (error) {
        console.error("getReserveofCDToken", error);
    }
}

module.exports = { getEtherBalance, getCDTokensBalance, getLPTokensBalance, getReserveofCDToken }