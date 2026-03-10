-- Seed Currencies
INSERT INTO currencies (id, code, name, flag_url) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'USD', 'US Dollar', 'https://flagcdn.com/w40/us.png'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'IRR', 'Iranian Rial', 'https://flagcdn.com/w40/ir.png'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'INR', 'Indian Rupee', 'https://flagcdn.com/w40/in.png')
ON CONFLICT (code) DO NOTHING;

-- Seed Receiver
INSERT INTO receivers (id, name, email, created_at) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000001', 'Taha Shokouhi', 'taha@email.com', '2024-12-22T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Seed Accounts (USD: 1 account, IRR: 2 accounts, INR: 1 account)
INSERT INTO accounts (id, receiver_id, currency_id, account_label) VALUES
  ('c1b2c3d4-0001-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', 'USD Account 1'),
  ('c1b2c3d4-0002-4000-8000-000000000002', 'b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0002-4000-8000-000000000002', 'IRR Account 1'),
  ('c1b2c3d4-0003-4000-8000-000000000003', 'b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0002-4000-8000-000000000002', 'IRR Account 2'),
  ('c1b2c3d4-0004-4000-8000-000000000004', 'b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0003-4000-8000-000000000003', 'INR Account 1')
ON CONFLICT (id) DO NOTHING;

-- Seed Transactions (matching the UI appendix)
-- USD Transactions
INSERT INTO transactions (id, receiver_id, currency_id, reference_number, "to", date_time, paid_with, amount, status) VALUES
  ('d1b2c3d4-0001-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', '6165131355468', 'Taha Shokouhi', '2024-12-23T15:40:00Z', 'ACH (Connected bank Accounts)', 3000.00, 'Approved'),
  ('d1b2c3d4-0002-4000-8000-000000000002', 'b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', '6165131355469', 'Taha Shokouhi', '2024-12-20T10:15:00Z', 'ACH (Connected bank Accounts)', 1500.00, 'Pending'),
  ('d1b2c3d4-0003-4000-8000-000000000003', 'b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', '6165131355470', 'Taha Shokouhi', '2024-12-18T09:30:00Z', 'ACH (Connected bank Accounts)', 750.00, 'Approved')
ON CONFLICT (id) DO NOTHING;

-- IRR Transactions
INSERT INTO transactions (id, receiver_id, currency_id, reference_number, "to", date_time, paid_with, amount, status) VALUES
  ('d1b2c3d4-0004-4000-8000-000000000004', 'b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0002-4000-8000-000000000002', '6165131355468', 'Taha Shokouhi', '2024-12-18T14:20:00Z', 'ACH (Connected bank Accounts)', 1191680.00, 'Pending'),
  ('d1b2c3d4-0005-4000-8000-000000000005', 'b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0002-4000-8000-000000000002', '6165131355468', 'Taha Shokouhi', '2024-12-18T08:15:00Z', 'ACH (Connected bank Accounts)', 1191680.00, 'Approved'),
  ('d1b2c3d4-0006-4000-8000-000000000006', 'b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0002-4000-8000-000000000002', '6165131355471', 'Taha Shokouhi', '2024-12-15T11:00:00Z', 'ACH (Connected bank Accounts)', 2500000.00, 'Approved')
ON CONFLICT (id) DO NOTHING;

-- INR Transactions
INSERT INTO transactions (id, receiver_id, currency_id, reference_number, "to", date_time, paid_with, amount, status) VALUES
  ('d1b2c3d4-0007-4000-8000-000000000007', 'b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0003-4000-8000-000000000003', '6165131355472', 'Taha Shokouhi', '2024-12-22T16:00:00Z', 'ACH (Connected bank Accounts)', 85000.00, 'Approved'),
  ('d1b2c3d4-0008-4000-8000-000000000008', 'b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0003-4000-8000-000000000003', '6165131355473', 'Taha Shokouhi', '2024-12-19T12:30:00Z', 'ACH (Connected bank Accounts)', 120000.00, 'Pending')
ON CONFLICT (id) DO NOTHING;
