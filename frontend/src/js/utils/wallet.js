export class Wallet {
  constructor(initialBalance) {
    this.balance = initialBalance;
    this.transactions = [];
  }

  deposit(amount) {
    if (amount <= 0) return false;
    this.balance += amount;
    this.recordTransaction('إيداع', amount);
    return true;
  }

  withdraw(amount) {
    if (amount <= 0 || amount > this.balance) return false;
    this.balance -= amount;
    this.recordTransaction('سحب', amount);
    return true;
  }

  recordTransaction(type, amount) {
    this.transactions.push({
      type,
      amount,
      date: new Date().toLocaleString(),
      newBalance: this.balance
    });
  }

  getTransactionHistory() {
    return [...this.transactions];
  }
}