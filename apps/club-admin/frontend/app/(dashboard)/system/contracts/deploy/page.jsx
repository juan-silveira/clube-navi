'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/services/api';
import { useTranslation } from '@/hooks/useTranslation';

export default function ContractDeployPage() {
    const { t } = useTranslation('deploy');
    const [contractType, setContractType] = useState('token');
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployResult, setDeployResult] = useState(null);

    // Token parameters
    const [tokenName, setTokenName] = useState('');
    const [tokenSymbol, setTokenSymbol] = useState('');
    const [initialSupply, setInitialSupply] = useState('');

    // Exchange parameters
    const [tokenA, setTokenA] = useState('');
    const [tokenB, setTokenB] = useState('');
    const [feeRecipient, setFeeRecipient] = useState('');
    const [feeBasisPoints, setFeeBasisPoints] = useState('');

    // Stake parameters
    const [stakeToken, setStakeToken] = useState('');
    const [rewardToken, setRewardToken] = useState('');
    const [minStakeAmount, setMinStakeAmount] = useState('');
    const [cycleStartDate, setCycleStartDate] = useState('');
    const [whitelist, setWhitelist] = useState('');

    const toPascalCase = (str) => {
        return str
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');
    };

    const dateToTimestamp = (dateString) => {
        if (!dateString) return 0;
        const date = new Date(dateString);
        date.setHours(12, 0, 0, 0); // Set to 12:00 PM
        return Math.floor(date.getTime() / 1000);
    };

    const handleDeploy = async () => {
        setIsDeploying(true);
        setDeployResult(null);

        try {
            let payload = {
                contractType
            };

            // Validate and prepare parameters based on contract type
            if (contractType === 'token') {
                if (!tokenName || !tokenSymbol || !initialSupply) {
                    toast.error(t('errors.requiredFields'));
                    setIsDeploying(false);
                    return;
                }

                payload = {
                    ...payload,
                    name: tokenName,
                    symbol: tokenSymbol.toUpperCase(),
                    initialSupply: initialSupply,
                    contractName: toPascalCase(tokenName)
                };
            } else if (contractType === 'exchange') {
                if (!tokenA || !tokenB || !feeRecipient || !feeBasisPoints) {
                    toast.error(t('errors.requiredFields'));
                    setIsDeploying(false);
                    return;
                }

                payload = {
                    ...payload,
                    tokenA,
                    tokenB,
                    feeRecipient,
                    feeBasisPoints: parseInt(feeBasisPoints)
                };
            } else if (contractType === 'stake') {
                if (!stakeToken || !minStakeAmount) {
                    toast.error(t('errors.requiredFields'));
                    setIsDeploying(false);
                    return;
                }

                const whitelistArray = whitelist
                    ? whitelist.split('\n').map(addr => addr.trim()).filter(addr => addr)
                    : [];

                payload = {
                    ...payload,
                    stakeToken,
                    rewardToken: rewardToken || stakeToken,
                    minStakeAmount,
                    cycleStartTimestamp: dateToTimestamp(cycleStartDate),
                    whitelist: whitelistArray
                };
            }

            const response = await api.post('/api/system/contracts/deploy', payload);

            const data = response.data;

            if (!data.success) {
                throw new Error(data.error || t('errors.deployError'));
            }

            setDeployResult(data);
            toast.success(t('success.deployed'));

            // Clear form
            resetForm();

        } catch (error) {
            console.error('Deploy error:', error);
            toast.error(error.message || t('errors.genericError'));
        } finally {
            setIsDeploying(false);
        }
    };

    const resetForm = () => {
        setTokenName('');
        setTokenSymbol('');
        setInitialSupply('');
        setTokenA('');
        setTokenB('');
        setFeeRecipient('');
        setFeeBasisPoints('');
        setStakeToken('');
        setRewardToken('');
        setMinStakeAmount('');
        setCycleStartDate('');
        setWhitelist('');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {t('title')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t('subtitle')}
                    </p>
                </div>

                {/* Contract Type Selection */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                        {t('contractType.label')}
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                        <button
                            onClick={() => setContractType('token')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                                contractType === 'token'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                            }`}
                        >
                            <div className="text-2xl mb-2">🪙</div>
                            <div className="font-semibold text-gray-900 dark:text-white">{t('contractType.token.title')}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {t('contractType.token.description')}
                            </div>
                        </button>

                        <button
                            onClick={() => setContractType('exchange')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                                contractType === 'exchange'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                            }`}
                        >
                            <div className="text-2xl mb-2">🔄</div>
                            <div className="font-semibold text-gray-900 dark:text-white">{t('contractType.exchange.title')}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {t('contractType.exchange.description')}
                            </div>
                        </button>

                        <button
                            onClick={() => setContractType('stake')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                                contractType === 'stake'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                            }`}
                        >
                            <div className="text-2xl mb-2">💎</div>
                            <div className="font-semibold text-gray-900 dark:text-white">{t('contractType.stake.title')}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {t('contractType.stake.description')}
                            </div>
                        </button>
                    </div>
                </div>

                {/* Parameters Form */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                        {t('parameters.title')}
                    </h2>

                    {/* Token Parameters */}
                    {contractType === 'token' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column - Parameters */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('parameters.token.name')} {t('parameters.required')}
                                        </label>
                                        <input
                                            type="text"
                                            value={tokenName}
                                            onChange={(e) => setTokenName(e.target.value)}
                                            placeholder={t('parameters.token.namePlaceholder')}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        {tokenName && (
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                {t('parameters.token.contractName')}: <span className="font-mono text-blue-600 dark:text-blue-400">{toPascalCase(tokenName)}</span>
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('parameters.token.symbol')} {t('parameters.required')}
                                        </label>
                                        <input
                                            type="text"
                                            value={tokenSymbol}
                                            onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                                            placeholder={t('parameters.token.symbolPlaceholder')}
                                            maxLength={10}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('parameters.token.initialSupply')} {t('parameters.required')}
                                        </label>
                                        <input
                                            type="number"
                                            value={initialSupply}
                                            onChange={(e) => setInitialSupply(e.target.value)}
                                            placeholder={t('parameters.token.initialSupplyPlaceholder')}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Right Column - Contract Preview */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('contractPreview.title')}
                                    </label>
                                    <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-[400px] border border-gray-700">
                                        <pre className="text-xs font-mono text-gray-300">
                                            <code>
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract `}<span className="text-yellow-400 font-bold">{tokenName ? toPascalCase(tokenName) : 'YourToken'}</span>{` is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant TRANSFER_ROLE = keccak256("TRANSFER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    constructor() ERC20(`}<span className="text-green-400">"{tokenName || 'Your Token'}"</span>{`, `}<span className="text-green-400">"{tokenSymbol || 'YTK'}"</span>{`) {
        _mint(msg.sender, `}<span className="text-blue-400">{initialSupply || '0'}</span>{` * 10 ** decimals());
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(TRANSFER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount)
        public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function burnFrom(address account, uint256 amount)
        public onlyRole(BURNER_ROLE) {
        _burn(account, amount);
    }

    function transferFromGasless(
        address from,
        address to,
        uint256 value
    ) public onlyRole(TRANSFER_ROLE) {
        _transfer(from, to, value);
    }
}`}
                                            </code>
                                        </pre>
                                    </div>
                                    <div className="mt-2 flex items-start space-x-2 text-xs text-gray-600 dark:text-gray-400">
                                        <span>💡</span>
                                        <div>
                                            <p className="font-medium">{t('contractPreview.tip.title')}</p>
                                            <ul className="mt-1 space-y-1 list-disc list-inside">
                                                <li>{t('contractPreview.tip.token.item1')}</li>
                                                <li>{t('contractPreview.tip.token.item2')}</li>
                                                <li>{t('contractPreview.tip.token.item3')}</li>
                                                <li>{t('contractPreview.tip.token.item4')}</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Exchange Parameters */}
                    {contractType === 'exchange' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('parameters.exchange.tokenA')} {t('parameters.required')}
                                </label>
                                <input
                                    type="text"
                                    value={tokenA}
                                    onChange={(e) => setTokenA(e.target.value)}
                                    placeholder={t('parameters.exchange.addressPlaceholder')}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('parameters.exchange.tokenB')} {t('parameters.required')}
                                </label>
                                <input
                                    type="text"
                                    value={tokenB}
                                    onChange={(e) => setTokenB(e.target.value)}
                                    placeholder={t('parameters.exchange.addressPlaceholder')}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('parameters.exchange.feeRecipient')} {t('parameters.required')}
                                </label>
                                <input
                                    type="text"
                                    value={feeRecipient}
                                    onChange={(e) => setFeeRecipient(e.target.value)}
                                    placeholder={t('parameters.exchange.addressPlaceholder')}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('parameters.exchange.feeBasisPoints')} {t('parameters.required')}
                                </label>
                                <input
                                    type="number"
                                    value={feeBasisPoints}
                                    onChange={(e) => setFeeBasisPoints(e.target.value)}
                                    placeholder={t('parameters.exchange.feePlaceholder')}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {feeBasisPoints && (
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {t('parameters.exchange.feeCalculated', { fee: (parseInt(feeBasisPoints) / 100).toFixed(2) })}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Stake Parameters */}
                    {contractType === 'stake' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('parameters.stake.stakeToken')} {t('parameters.required')}
                                </label>
                                <input
                                    type="text"
                                    value={stakeToken}
                                    onChange={(e) => setStakeToken(e.target.value)}
                                    placeholder={t('parameters.stake.addressPlaceholder')}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('parameters.stake.rewardToken')}
                                </label>
                                <input
                                    type="text"
                                    value={rewardToken}
                                    onChange={(e) => setRewardToken(e.target.value)}
                                    placeholder={t('parameters.stake.rewardTokenPlaceholder')}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('parameters.stake.minStakeAmount')} {t('parameters.required')}
                                </label>
                                <input
                                    type="text"
                                    value={minStakeAmount}
                                    onChange={(e) => setMinStakeAmount(e.target.value)}
                                    placeholder={t('parameters.stake.minStakeAmountPlaceholder')}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('parameters.stake.cycleStartDate')}
                                </label>
                                <input
                                    type="date"
                                    value={cycleStartDate}
                                    onChange={(e) => setCycleStartDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {cycleStartDate && (
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {t('parameters.stake.cycleStartTimestamp', { timestamp: dateToTimestamp(cycleStartDate) })}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('parameters.stake.whitelist')}
                                </label>
                                <textarea
                                    value={whitelist}
                                    onChange={(e) => setWhitelist(e.target.value)}
                                    placeholder={t('parameters.stake.whitelistPlaceholder')}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                />
                                {whitelist && (
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {t('parameters.stake.whitelistCount', { count: whitelist.split('\n').filter(a => a.trim()).length })}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Deploy Button */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                    <button
                        onClick={handleDeploy}
                        disabled={isDeploying}
                        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
                    >
                        {isDeploying ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('buttons.deploying')}
                            </>
                        ) : (
                            <>
                                {t('buttons.deploy')}
                            </>
                        )}
                    </button>
                </div>

                {/* Deploy Result */}
                {deployResult && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
                            {t('result.title')}
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex">
                                <span className="font-medium text-gray-700 dark:text-gray-300 w-32">{t('result.address')}</span>
                                <span className="font-mono text-gray-900 dark:text-white break-all">{deployResult.contractAddress}</span>
                            </div>
                            <div className="flex">
                                <span className="font-medium text-gray-700 dark:text-gray-300 w-32">{t('result.txHash')}</span>
                                <span className="font-mono text-gray-900 dark:text-white break-all">{deployResult.transactionHash}</span>
                            </div>
                            <div className="flex">
                                <span className="font-medium text-gray-700 dark:text-gray-300 w-32">{t('result.blockNumber')}</span>
                                <span className="text-gray-900 dark:text-white">{deployResult.blockNumber}</span>
                            </div>
                            <div className="flex">
                                <span className="font-medium text-gray-700 dark:text-gray-300 w-32">{t('result.gasUsed')}</span>
                                <span className="text-gray-900 dark:text-white">{deployResult.gasUsed}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}