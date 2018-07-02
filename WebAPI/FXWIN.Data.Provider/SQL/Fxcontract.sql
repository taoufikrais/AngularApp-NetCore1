-- add constraint FK_FxContract_Currency
ALTER TABLE [dbo].[FxContract]  WITH NOCHECK ADD  CONSTRAINT [FK_FxContract_Currency] FOREIGN KEY([CurrencyId])
REFERENCES [dbo].[Currency] ([Id])
ON DELETE SET NULL
GO