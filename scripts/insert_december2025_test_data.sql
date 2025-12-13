-- Add a checking account with a starting balance
INSERT INTO accounts (id, name, type, balance, institution) VALUES (1, 'Main Checking', 'Checking', 2500.00, 'Bank of Example');

-- Add a savings account
INSERT INTO accounts (id, name, type, balance, institution) VALUES (2, 'Family Savings', 'Savings', 1200.00, 'Bank of Example');

-- Add income transactions for December 2025
INSERT INTO transactions (id, date, amount, description, account_id) VALUES
  (1001, '2025-12-01', 3200.00, 'Paycheck', 1),
  (1002, '2025-12-15', 3200.00, 'Paycheck', 1);

-- Add expense transactions for December 2025
INSERT INTO transactions (id, date, amount, description, account_id) VALUES
  (2001, '2025-12-02', -1500.00, 'Rent', 1),
  (2002, '2025-12-05', -300.00, 'Utilities', 1),
  (2003, '2025-12-07', -600.00, 'Groceries', 1),
  (2004, '2025-12-10', -200.00, 'Transportation', 1),
  (2005, '2025-12-12', -100.00, 'Internet', 1),
  (2006, '2025-12-14', -90.00, 'Phone', 1),
  (2007, '2025-12-16', -400.00, 'Insurance', 1),
  (2008, '2025-12-18', -350.00, 'Childcare', 1),
  (2009, '2025-12-20', -45.00, 'Streaming Services', 1),
  (2010, '2025-12-22', -200.00, 'Other', 1);
