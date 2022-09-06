import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useEffect, useRef, useState } from "react";
import { BigNumber, providers, utils } from "ethers";
import web3Modal from "web3modal";
import { getEtherBalance, getCDTokensBalance, getLPTokensBalance, getReserveofCDToken } from "../utils/getAmounts";
import { getAmountOfTokensReceivedFromSwap, swapTokens } from "../utils/swap";
import{addliquidity,calculateCD} from "../utils/addLiquidity";
import{removeLiquidity, getTokensAfterRemove} from "../utils/removalLiquidity";
export default function Home() {

  const web3ModalRef = useRef();
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const zero = BigNumber.from(0);
  const [etherBalance, setEtherBalance] = useState(zero);
  const [cdBalance, setCDBalance] = useState(zero);
  const [lpBalance, setLPBalance] = useState(zero);
  const [reservedCD, setReservedCD] = useState(zero);
  const [etherBalanceContract, setEtherBalanceContract] = useState(zero);
  const [swapAmount, setSwapAmount] = useState("")
  const [tokenToBeReceivedAfterSwap, settokenToBeReceivedAfterSwap] = useState(zero);
  const [removeCD, setRemoveCD] = useState(zero);
  const [removeEther, setRemoveEther] = useState(zero);
  const [addCDTokens, setAddCDTokens] = useState(zero);
  const [liquidityTab, setLiquidityTab] = useState(true);
  const [addEther,setAddEther] =useState(zero);
  const [removeLPTokens,setRemoveLPTokens] = useState("0");
  const[ethSelected,setEthSelected] = useState(true);

// console.log("etherBalance",(utils.formatEther(etherBalance)));
// console.log("walletConnected", walletConnected);
// console.log("cdBalance",(utils.formatEther(cdBalance)));
// console.log("lpBalance",(utils.formatEther(lpBalance)));
// console.log("reservedCD",(utils.formatEther(reservedCD)));
// console.log("etherBalanceContract",(utils.formatEther(etherBalanceContract)));
// console.log("liquidityTab",liquidityTab);
// console.log("tokenToBeReceivedAfterSwap",tokenToBeReceivedAfterSwap);
// console.log("addEther",addEther);
// console.log("removeLPTokens",utils.formatEther(removeLPTokens));
// console.log("setAddTokens", BigNumber.form(utils.formatEther(addCDTokens)));


  const getAmounts = async () => {
    try {
      const provider = await getProviderOrSigner(false);
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const _ethBalance = await getEtherBalance(provider, address);
      const _cdBalance = await getCDTokensBalance(provider, address);
      const _lpBalance = await getLPTokensBalance(provider, address);
      const _reservedCD = await getReserveofCDToken(provider);
      const _ethBalanceContract = await getEtherBalance(provider, null, true)
      setEtherBalance(_ethBalance);
      setCDBalance(_cdBalance);
      setLPBalance(_lpBalance);
      setReservedCD(_reservedCD);
      setEtherBalanceContract(_ethBalanceContract);
    } catch (error) {
      console.error("getAmount", error);
    }
  };

  const _swapTokens = async () => {
    try {
      const swapAmountWei = utils.parseEther(swapAmount);
      if (!swapAmountWei.eq(zero)) {
        const signer = await getProviderOrSigner(true);
        setLoading(true);
        await swapTokens(signer, swapAmountWei, tokenToBeReceivedAfterSwap, ethSelected);
        setLoading(false);
        await getAmounts();
        setSwapAmount("");
      }
    } catch (error) {
      console.error("_swapTokens", error);
      setLoading(false);
      setSwapAmount("");
    }
  }

  const _getAmountOfTokensReceivedFromSwap = async (_swapAmount) => {
    try {
      const _swapAmountWEI = utils.parseEther(_swapAmount.toString());

      if (!_swapAmountWEI.eq(zero)) {
        const provider = await getProviderOrSigner();
        const _ethBalance = await getEtherBalance(provider, null, true);
        const amountOfTokens = await getAmountOfTokensReceivedFromSwap(_swapAmount, provider, ethSelected, _ethBalance, reservedCD);
        settokenToBeReceivedAfterSwap(amountOfTokens);
      } else {
        settokenToBeReceivedAfterSwap(zero);
      }
    } catch (error) {
      console.error("_getAmountOfTokensReceivedFromSwap", error);
    }
  }

  const _addLiquidity = async () => {
    try {
      const addEtherWei = utils.parseEther(addEther.toString());

      if (!addCDTokens.eq(zero) && !addEtherWei.eq(zero)) {
        const signer = await getProviderOrSigner(true);
        setLoading(true);
        await addliquidity(signer, addCDTokens, addEtherWei);
        setLoading(false);
        setAddCDTokens(zero);
        await getAmounts();
      } else {
        setAddCDTokens(zero);
      }
    } catch (error) {
      console.error("_addLiquidity", error);
      setLoading(false);
      setAddCDTokens(zero);
    }
  }

  const _removeLiquidity = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const removeLPTokenWei = utils.parseEther(removeLPTokens.toString());
      setLoading(true);
      await removeLiquidity(signer, removeLPTokenWei);
      setLoading(false);
      await getAmounts();
      setRemoveCD(zero);
      setRemoveEther(zero);
    } catch (error) {
      console.error("_removaLiquidity", error);
      setLoading(false);
      setRemoveCD(zero);
      setRemoveEther(zero);
    }
  }

  const _getTokensAfterRemove = async (_removeLPTokens) => {
    try {
      const provider = await getProviderOrSigner();
      const removeLPTokenWei = utils.parseEther(_removeLPTokens);
      const _ethBalance = await getEtherBalance(provider, null, true);
      const cryptoDevTokenReserve = await getReserveofCDToken(provider);
      const { _removeEther, _removeCD } = await getTokensAfterRemove(provider, removeLPTokenWei,
        _ethBalance, cryptoDevTokenReserve);
      setRemoveEther(_removeEther);
      setRemoveCD(_removeCD);
    } catch (error) {
      console.error("_getTokensAfterRemove", error);
    }
  }
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error("connectWallet", error);
    }
  }

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const { chainId } = await web3Provider.getNetwork();
    if (chainId != 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("change network to Rinkeby");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getAmounts();
    }
  }, [walletConnected]);

  const renderButton = () => {
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }

    if (liquidityTab) {
      return (
        <div>
          <div className={styles.description}>
            you have:
            <br />
            {utils.formatEther(cdBalance)} Crypto Dev Token<br />
            {utils.formatEther(etherBalance)} Ether <br />
            {utils.formatEther(lpBalance)} Crypto Dev LP tokens
          </div>
          <div>
            {utils.parseEther(reservedCD.toString()).eq(zero) ? (
              <div>
                <input
                  type="number"
                  placeholder='Amount of Ether'
                  onChange={(e) => setAddEther(e.target.value || "0")}
                  className={styles.input} />
                <input
                  type="number"
                  placeholder='Amount of CryptoDev tokens'
                  onChange={(e) => { setAddCDTokens(BigNumber.from(e.target.value || "0"))}}
                  className={styles.input}
                />
                <button className={styles.button1} onClick={_addLiquidity}>Add</button>
              </div>
            ) : (
              <div>
                <input
                  type="number"
                  placeholder='amount of Ether'
                  onChange={async (e) => {
                    setAddEther(e.target.value || "0");
                    const _addCDTokens = await calculateCD(
                      e.target.value || "0",
                      etherBalanceContract,
                      reservedCD
                    );
                    setAddCDTokens(_addCDTokens)
                  }}
                  className={styles.input} />
                <div className={styles.inputDiv}>
                  {`you will need ${utils.formatEther(addCDTokens)} Crypto Dev Tokens`}
                </div>
                <button className={styles.button1} onClick={_addLiquidity}> Add </button>
              </div>
            )}
            <div>
              <input
                type="number"
                placeholder='Amount of LP Tokens'
                onChange={async (e) => {
                  setRemoveLPTokens(e.target.value || "0");
                  await _getTokensAfterRemove(e.target.value || "0");
                }}
                className={styles.input} />

              <div className={styles.inputDiv}>
                {`you will get ${utils.formatEther(removeCD)} Crypto Dev Tokens and ${utils.formatEther(removeEther)} Ether`}
              </div>
              <button className={styles.button1} onClick={_removeLiquidity} > Remove </button>
            </div>
          </div>
        </div>
          );
            } else{
            return(
        <div>
          <div>
            <input
              type="number"
              placeholder="Amount"
              onChange={async (e) => {
                setSwapAmount(e.target.value || "0");
              }} className={styles.input}
              value={swapAmount} />

            < select className={styles.select}
              name="dropdown"
              id="dropdown"
              onChange={async () => {
                setEthSelected(!ethSelected);
                await _getAmountOfTokensReceivedFromSwap(0);
                setSwapAmount("");
              }} >

              <option value="eth"> Ethereum</option>
              <option value="cryptoDevToken">Crypto Dev Token</option>
            </select>
            <br />
            <div className={styles.inputDiv}>
              {ethSelected ? `you will get ${utils.formatEther(tokenToBeReceivedAfterSwap)} Crypto Dev Tokens` :
                `you will get ${utils.formatEther(tokenToBeReceivedAfterSwap)} Eth`}
            </div>
            <button className={styles.button1} onClick={_swapTokens}>
              Swap
            </button>
          </div>
        </div>
      );
    }
  };

          return (
          <div className={styles.container}>
            <Head>
              <title>Create Next App</title>
              <meta name="description" content="Generated by create next app" />
              <link rel="icon" href="/favicon.ico" />
            </Head>

           <div className={styles.main}>
            <div>
              <h1 className={styles.title}> Welcome to Nitesh Exchange!</h1>
              <div className={styles.description}> Exchange Ethereum &#60;&#62; CryptoDev Tokens </div>
            </div>
            <button className={styles.button} onClick ={() => {setLiquidityTab(true);}} >
              Liquidity
            </button>
            < button className ={styles.button} onClick ={() => {setLiquidityTab(false);}} >
            Swap
            </button>
           </div>
           {renderButton()}
            <footer className={styles.footer}>
              <a
                href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
                target="_blank"
                rel="noopener noreferrer"
              >
                Powered by{' '}
                <span className={styles.logo}>
                  <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
                </span>
              </a>
            </footer>
          </div>
          )
}
