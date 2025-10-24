pragma solidity ^ 0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract RealEstateTokenization is Ownable, ReentrancyGuard {
  uint256 public propertyCounter;
  uint256 public platformFeePercent = 2;

  enum PropertyStatus {
    Pending,
    Active,
    Funded,
    Completed,
    Cancelled
  } enum InvestmentType {
    Rental,
    Appreciation,
    Both
  }

  struct Property {
    uint256 propertyId;
    address propertyOwner;
    string name;
    string location;
    string documentHash;
    uint256 totalValue;
    uint256 tokenPrice;
    uint256 totalTokens;
    uint256 tokensSold;
    uint256 minInvestment;
    uint256 expectedROI;
    InvestmentType investmentType;
    PropertyStatus status;
    uint256 listingDate;
    uint256 fundingDeadline;
    address tokenContract;
    bool revenueDistributed;
  }

  struct Investment {
    uint256 propertyId;
    address investor;
    uint256 tokensOwned;
    uint256 investmentAmount;
    uint256 investmentDate;
    uint256 revenueEarned;
  }

  struct RevenueDistribution {
    uint256 propertyId;
    uint256 totalRevenue;
    uint256 revenuePerToken;
    uint256 distributionDate;
    mapping(address = > bool) claimed;
  }

  mapping(uint256 = > Property) public properties;
  mapping(uint256 = > RevenueDistribution) public revenueDistributions;
  mapping(address = > uint256[]) public investorProperties;
  mapping(uint256 = > mapping(address = > Investment)) public investments;
  mapping(uint256 = > address[]) public propertyInvestors;
  mapping(uint256 = > uint256) public distributionCounter;

  event PropertyListed(uint256 indexed propertyId, address indexed owner,
                       string name, uint256 totalValue, uint256 totalTokens);

  event TokensPurchased(uint256 indexed propertyId, address indexed investor,
                        uint256 tokens, uint256 amount);

  modifier propertyExists(uint256 _propertyId) {
    require(_propertyId > 0 && _propertyId <= propertyCounter,
            "Property does not exist");
    _;
  }

  modifier onlyPropertyOwner(uint256 _propertyId) {
    require(properties[_propertyId].propertyOwner == msg.sender,
            "Only property owner can call this");
    _;
  }

  constructor() {}

  function listProperty(string memory _name, string memory _location,
                        string memory _documentHash, uint256 _totalValue,
                        uint256 _totalTokens, uint256 _minInvestment,
                        uint256 _expectedROI, InvestmentType _investmentType,
                        uint256 _fundingDuration) external returns(uint256) {
    require(_totalValue > 0, "Total value must be greater than 0");
    require(_totalTokens > 0, "Total tokens must be greater than 0");
    require(_fundingDuration > 0, "Funding duration must be specified");

    propertyCounter++;
    uint256 tokenPrice = _totalValue / _totalTokens;

    PropertyToken newToken = new PropertyToken(
        _name, string(abi.encodePacked("RE", uint2str(propertyCounter))),
        _totalTokens);

    properties[propertyCounter] = Property({
      propertyId : propertyCounter,
      propertyOwner : msg.sender,
      name : _name,
      location : _location,
      documentHash : _documentHash,
      totalValue : _totalValue,
      tokenPrice : tokenPrice,
      totalTokens : _totalTokens,
      tokensSold : 0,
      minInvestment : _minInvestment,
      expectedROI : _expectedROI,
      investmentType : _investmentType,
      status : PropertyStatus.Active,
      listingDate : block.timestamp,
      fundingDeadline : block.timestamp + _fundingDuration,
      tokenContract : address(newToken),
      revenueDistributed : false
    });

    emit PropertyListed(propertyCounter, msg.sender, _name, _totalValue,
                        _totalTokens);

    return propertyCounter;
  }

  function purchaseTokens(uint256 _propertyId, uint256 _tokenAmount)
      external payable propertyExists(_propertyId) nonReentrant {
    Property storage property = properties[_propertyId];

    require(property.status == PropertyStatus.Active, "Property not active");
    require(block.timestamp <= property.fundingDeadline,
            "Funding period ended");
    require(_tokenAmount > 0, "Must purchase at least 1 token");
    require(property.tokensSold + _tokenAmount <= property.totalTokens,
            "Not enough tokens available");

    uint256 totalCost = _tokenAmount * property.tokenPrice;
    require(msg.value >= totalCost, "Insufficient payment");
    require(msg.value >= property.minInvestment ||
                investments[_propertyId][msg.sender].tokensOwned > 0,
            "Below minimum investment");

    // Update or create investment
    if (investments[_propertyId][msg.sender].tokensOwned == 0) {
      investments[_propertyId][msg.sender] = Investment({
        propertyId : _propertyId,
        investor : msg.sender,
        tokensOwned : _tokenAmount,
        investmentAmount : msg.value,
        investmentDate : block.timestamp,
        revenueEarned : 0
      });
      propertyInvestors[_propertyId].push(msg.sender);
      investorProperties[msg.sender].push(_propertyId);
    } else {
      investments[_propertyId][msg.sender].tokensOwned += _tokenAmount;
      investments[_propertyId][msg.sender].investmentAmount += msg.value;
    }

    property.tokensSold += _tokenAmount;

    PropertyToken token = PropertyToken(property.tokenContract);
    token.mint(msg.sender, _tokenAmount);

    if (property.tokensSold == property.totalTokens) {
      property.status = PropertyStatus.Funded;

      uint256 platformFee = (property.totalValue * platformFeePercent) / 100;
      uint256 ownerAmount = property.totalValue - platformFee;

      payable(property.propertyOwner).transfer(ownerAmount);
      payable(owner()).transfer(platformFee);

      emit PropertyFunded(_propertyId, property.totalValue);
    }

    if (msg.value > totalCost) {
      payable(msg.sender).transfer(msg.value - totalCost);
    }

    emit TokensPurchased(_propertyId, msg.sender, _tokenAmount, totalCost);
  }
}
