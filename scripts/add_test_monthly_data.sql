-- Add realistic test data for a ~$60k/year household for the last 6 months
-- December 2025
INSERT INTO transactions (date, amount, category, accountId, description) VALUES
('2025-12-01', 4200, 'Job (Primary)', 1, 'Paycheck'),
('2025-12-01', 800, 'Job (Spouse)', 2, 'Paycheck'),
('2025-12-05', 300, 'Child Tax Credit', 1, 'Tax Credit'),
('2025-12-10', 150, 'Freelance Work', 1, 'Freelance'),
('2025-12-15', 600, 'Groceries', 1, 'Groceries'),
('2025-12-20', -1500, 'Rent/Mortgage', 1, 'Rent'),
('2025-12-21', -250, 'Utilities', 1, 'Utilities'),
('2025-12-22', -400, 'Insurance', 1, 'Insurance'),
('2025-12-23', -350, 'Childcare', 1, 'Childcare'),
('2025-12-24', -300, 'Transportation', 1, 'Transportation'),
('2025-12-25', -600, 'Groceries', 1, 'Groceries'),
('2025-12-26', -80, 'Internet', 1, 'Internet'),
('2025-12-27', -90, 'Phone', 1, 'Phone'),
('2025-12-28', -45, 'Streaming Services', 1, 'Streaming'),
('2025-12-29', -200, 'Other', 1, 'Other');
-- Repeat for previous 5 months (Nov, Oct, Sep, Aug, Jul 2025) with similar but slightly varied values
-- November 2025
INSERT INTO transactions (date, amount, category, accountId, description) VALUES
('2025-11-01', 4200, 'Job (Primary)', 1, 'Paycheck'),
('2025-11-01', 800, 'Job (Spouse)', 2, 'Paycheck'),
('2025-11-05', 300, 'Child Tax Credit', 1, 'Tax Credit'),
('2025-11-10', 200, 'Freelance Work', 1, 'Freelance'),
('2025-11-15', -650, 'Groceries', 1, 'Groceries'),
('2025-11-20', -1500, 'Rent/Mortgage', 1, 'Rent'),
('2025-11-21', -250, 'Utilities', 1, 'Utilities'),
('2025-11-22', -400, 'Insurance', 1, 'Insurance'),
('2025-11-23', -350, 'Childcare', 1, 'Childcare'),
('2025-11-24', -300, 'Transportation', 1, 'Transportation'),
('2025-11-25', -600, 'Groceries', 1, 'Groceries'),
('2025-11-26', -80, 'Internet', 1, 'Internet'),
('2025-11-27', -90, 'Phone', 1, 'Phone'),
('2025-11-28', -45, 'Streaming Services', 1, 'Streaming'),
('2025-11-29', -200, 'Other', 1, 'Other');
-- October 2025
INSERT INTO transactions (date, amount, category, accountId, description) VALUES
('2025-10-01', 4200, 'Job (Primary)', 1, 'Paycheck'),
('2025-10-01', 800, 'Job (Spouse)', 2, 'Paycheck'),
('2025-10-05', 300, 'Child Tax Credit', 1, 'Tax Credit'),
('2025-10-10', 100, 'Freelance Work', 1, 'Freelance'),
('2025-10-15', -600, 'Groceries', 1, 'Groceries'),
('2025-10-20', -1500, 'Rent/Mortgage', 1, 'Rent'),
('2025-10-21', -250, 'Utilities', 1, 'Utilities'),
('2025-10-22', -400, 'Insurance', 1, 'Insurance'),
('2025-10-23', -350, 'Childcare', 1, 'Childcare'),
('2025-10-24', -300, 'Transportation', 1, 'Transportation'),
('2025-10-25', -600, 'Groceries', 1, 'Groceries'),
('2025-10-26', -80, 'Internet', 1, 'Internet'),
('2025-10-27', -90, 'Phone', 1, 'Phone'),
('2025-10-28', -45, 'Streaming Services', 1, 'Streaming'),
('2025-10-29', -200, 'Other', 1, 'Other');
-- September 2025
INSERT INTO transactions (date, amount, category, accountId, description) VALUES
('2025-09-01', 4200, 'Job (Primary)', 1, 'Paycheck'),
('2025-09-01', 800, 'Job (Spouse)', 2, 'Paycheck'),
('2025-09-05', 300, 'Child Tax Credit', 1, 'Tax Credit'),
('2025-09-10', 150, 'Freelance Work', 1, 'Freelance'),
('2025-09-15', -600, 'Groceries', 1, 'Groceries'),
('2025-09-20', -1500, 'Rent/Mortgage', 1, 'Rent'),
('2025-09-21', -250, 'Utilities', 1, 'Utilities'),
('2025-09-22', -400, 'Insurance', 1, 'Insurance'),
('2025-09-23', -350, 'Childcare', 1, 'Childcare'),
('2025-09-24', -300, 'Transportation', 1, 'Transportation'),
('2025-09-25', -600, 'Groceries', 1, 'Groceries'),
('2025-09-26', -80, 'Internet', 1, 'Internet'),
('2025-09-27', -90, 'Phone', 1, 'Phone'),
('2025-09-28', -45, 'Streaming Services', 1, 'Streaming'),
('2025-09-29', -200, 'Other', 1, 'Other');
-- August 2025
INSERT INTO transactions (date, amount, category, accountId, description) VALUES
('2025-08-01', 4200, 'Job (Primary)', 1, 'Paycheck'),
('2025-08-01', 800, 'Job (Spouse)', 2, 'Paycheck'),
('2025-08-05', 300, 'Child Tax Credit', 1, 'Tax Credit'),
('2025-08-10', 200, 'Freelance Work', 1, 'Freelance'),
('2025-08-15', -650, 'Groceries', 1, 'Groceries'),
('2025-08-20', -1500, 'Rent/Mortgage', 1, 'Rent'),
('2025-08-21', -250, 'Utilities', 1, 'Utilities'),
('2025-08-22', -400, 'Insurance', 1, 'Insurance'),
('2025-08-23', -350, 'Childcare', 1, 'Childcare'),
('2025-08-24', -300, 'Transportation', 1, 'Transportation'),
('2025-08-25', -600, 'Groceries', 1, 'Groceries'),
('2025-08-26', -80, 'Internet', 1, 'Internet'),
('2025-08-27', -90, 'Phone', 1, 'Phone'),
('2025-08-28', -45, 'Streaming Services', 1, 'Streaming'),
('2025-08-29', -200, 'Other', 1, 'Other');
-- July 2025
INSERT INTO transactions (date, amount, category, accountId, description) VALUES
('2025-07-01', 4200, 'Job (Primary)', 1, 'Paycheck'),
('2025-07-01', 800, 'Job (Spouse)', 2, 'Paycheck'),
('2025-07-05', 300, 'Child Tax Credit', 1, 'Tax Credit'),
('2025-07-10', 100, 'Freelance Work', 1, 'Freelance'),
('2025-07-15', -600, 'Groceries', 1, 'Groceries'),
('2025-07-20', -1500, 'Rent/Mortgage', 1, 'Rent'),
('2025-07-21', -250, 'Utilities', 1, 'Utilities'),
('2025-07-22', -400, 'Insurance', 1, 'Insurance'),
('2025-07-23', -350, 'Childcare', 1, 'Childcare'),
('2025-07-24', -300, 'Transportation', 1, 'Transportation'),
('2025-07-25', -600, 'Groceries', 1, 'Groceries'),
('2025-07-26', -80, 'Internet', 1, 'Internet'),
('2025-07-27', -90, 'Phone', 1, 'Phone'),
('2025-07-28', -45, 'Streaming Services', 1, 'Streaming'),
('2025-07-29', -200, 'Other', 1, 'Other');
