// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title RealEstateTokenization
 * @dev A platform for tokenizing real estate properties and enabling fractional ownership
 */
contract RealEstateTokenization {
    
    struct Property {
        uint256 propertyId;
        string propertyAddress;
        uint256 totalValue;
        uint256 totalTokens;
        uint256 availableTokens;
        address owner;
        bool isActive;
        uint256 pricePerToken;
    }
    
    struct Investment {
        uint256 propertyId;
        uint256 tokenAmount;
        uint256 investmentDate;
    }
    
    // State variables
    uint256 private propertyCounter;
    mapping(uint256 => Property) public properties;
    mapping(address => mapping(uint256 => uint256)) public investorTokens; // investor => propertyId => tokens
    mapping(address => uint256[]) private investorProperties;
    
    // Events
    event PropertyListed(uint256 indexed propertyId, string propertyAddress, uint256 totalValue, uint256 totalTokens);
    event TokensPurchased(uint256 indexed propertyId, address indexed investor, uint256 tokenAmount, uint256 totalCost);
    event TokensTransferred(uint256 indexed propertyId, address indexed from, address indexed to, uint256 tokenAmount);
    
    /**
     * @dev List a new property for tokenization
     * @param _propertyAddress Physical address of the property
     * @param _totalValue Total valuation of the property in wei
     * @param _totalTokens Number of tokens to represent the property
     */
    function listProperty(
        string memory _propertyAddress,
        uint256 _totalValue,
        uint256 _totalTokens
    ) external returns (uint256) {
        require(_totalValue > 0, "Property value must be greater than 0");
        require(_totalTokens > 0, "Total tokens must be greater than 0");
        require(bytes(_propertyAddress).length > 0, "Property address cannot be empty");
        
        propertyCounter++;
        uint256 pricePerToken = _totalValue / _totalTokens;
        
        properties[propertyCounter] = Property({
            propertyId: propertyCounter,
            propertyAddress: _propertyAddress,
            totalValue: _totalValue,
            totalTokens: _totalTokens,
            availableTokens: _totalTokens,
            owner: msg.sender,
            isActive: true,
            pricePerToken: pricePerToken
        });
        
        emit PropertyListed(propertyCounter, _propertyAddress, _totalValue, _totalTokens);
        return propertyCounter;
    }
    
    /**
     * @dev Purchase tokens of a listed property
     * @param _propertyId ID of the property to invest in
     * @param _tokenAmount Number of tokens to purchase
     */
    function purchaseTokens(uint256 _propertyId, uint256 _tokenAmount) external payable {
        Property storage property = properties[_propertyId];
        
        require(property.isActive, "Property is not active");
        require(_tokenAmount > 0, "Token amount must be greater than 0");
        require(_tokenAmount <= property.availableTokens, "Not enough tokens available");
        
        uint256 totalCost = property.pricePerToken * _tokenAmount;
        require(msg.value >= totalCost, "Insufficient payment");
        
        // Update property state
        property.availableTokens -= _tokenAmount;
        
        // Update investor state
        if (investorTokens[msg.sender][_propertyId] == 0) {
            investorProperties[msg.sender].push(_propertyId);
        }
        investorTokens[msg.sender][_propertyId] += _tokenAmount;
        
        // Transfer funds to property owner
        payable(property.owner).transfer(totalCost);
        
        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        emit TokensPurchased(_propertyId, msg.sender, _tokenAmount, totalCost);
    }
    
    /**
     * @dev Transfer tokens to another address
     * @param _propertyId ID of the property
     * @param _to Recipient address
     * @param _tokenAmount Number of tokens to transfer
     */
    function transferTokens(
        uint256 _propertyId,
        address _to,
        uint256 _tokenAmount
    ) external {
        require(_to != address(0), "Invalid recipient address");
        require(_to != msg.sender, "Cannot transfer to yourself");
        require(properties[_propertyId].isActive, "Property is not active");
        require(investorTokens[msg.sender][_propertyId] >= _tokenAmount, "Insufficient token balance");
        require(_tokenAmount > 0, "Token amount must be greater than 0");
        
        // Update balances
        investorTokens[msg.sender][_propertyId] -= _tokenAmount;
        
        if (investorTokens[_to][_propertyId] == 0) {
            investorProperties[_to].push(_propertyId);
        }
        investorTokens[_to][_propertyId] += _tokenAmount;
        
        emit TokensTransferred(_propertyId, msg.sender, _to, _tokenAmount);
    }
    
    // View functions
    function getPropertyDetails(uint256 _propertyId) external view returns (
        string memory propertyAddress,
        uint256 totalValue,
        uint256 totalTokens,
        uint256 availableTokens,
        address owner,
        bool isActive,
        uint256 pricePerToken
    ) {
        Property memory property = properties[_propertyId];
        return (
            property.propertyAddress,
            property.totalValue,
            property.totalTokens,
            property.availableTokens,
            property.owner,
            property.isActive,
            property.pricePerToken
        );
    }
    
    function getInvestorTokenBalance(address _investor, uint256 _propertyId) external view returns (uint256) {
        return investorTokens[_investor][_propertyId];
    }
    
    function getInvestorProperties(address _investor) external view returns (uint256[] memory) {
        return investorProperties[_investor];
    }
    
    function getTotalProperties() external view returns (uint256) {
        return propertyCounter;
    }
}
