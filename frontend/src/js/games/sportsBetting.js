export class SportsBetting {
  constructor() {
    this.availableSports = ['football', 'basketball', 'tennis'];
    this.oddsProvider = new OddsProvider();
  }

  async loadLiveEvents(sport) {
    if (!this.availableSports.includes(sport)) {
      throw new Error('الرياضة غير مدعومة');
    }

    return this.oddsProvider.getLiveEvents(sport);
  }

  async placeBet(betData) {
    const { eventId, market, selection, stake } = betData;
    
    if (!this.validateStake(stake)) {
      throw new Error('مبلغ الرهان غير صالح');
    }

    const odds = await this.oddsProvider.getCurrentOdds(eventId, market);
    const potentialWin = stake * odds;

    return {
      betId: this.generateBetId(),
      eventId,
      market,
      selection,
      stake,
      odds,
      potentialWin,
      status: 'pending'
    };
  }

  generateBetId() {
    return `bet_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }
}