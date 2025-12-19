-- Add realistic income sources for a ~$60k/year household with various frequencies
INSERT INTO income_sources (name, type, earner, frequency, expected_amount, notes) VALUES ('Primary Salary', 'salary', 'Alex', 'bi-weekly', 1800, 'Main household earner');
INSERT INTO income_sources (name, type, earner, frequency, expected_amount, notes) VALUES ('Secondary Salary', 'salary', 'Jamie', 'monthly', 1200, 'Second earner');
INSERT INTO income_sources (name, type, earner, frequency, expected_amount, notes) VALUES ('Freelance Work', 'freelance', 'Alex', 'monthly', 400, 'Side income');
INSERT INTO income_sources (name, type, earner, frequency, expected_amount, notes) VALUES ('Investment Income', 'investment', 'Alex', 'annual', 600, 'Interest and dividends');
INSERT INTO income_sources (name, type, earner, frequency, expected_amount, notes) VALUES ('Child Tax Credit', 'other', 'Family', 'annual', 2000, 'Government benefit');
-- End realistic test data
