package com.niraj.backend;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ImportService {

    public record ImportResult(int transactions, int budgets) {
    }

    private final TransactionRepository transactions;
    private final BudgetRepository budgets;

    public ImportService(TransactionRepository transactions, BudgetRepository budgets) {
        this.transactions = transactions;
        this.budgets = budgets;
    }

    // One database transaction: if anything throws, the delete is rolled back too.
    @Transactional
    public ImportResult replaceAll(long userId, ImportRequest request) {
        transactions.deleteAllForUser(userId);
        budgets.deleteAllForUser(userId);

        var newTransactions = request.transactions().stream().map(r -> {
            TransactionEntity e = new TransactionEntity();
            e.setUserId(userId);
            e.setDescription(r.description());
            e.setAmount(r.amount());
            e.setType(r.type());
            e.setCategory(r.category());
            e.setDate(r.date());
            return e;
        }).toList();
        transactions.saveAll(newTransactions);

        var newBudgets = request.budgets().entrySet().stream()
                .map((Map.Entry<String, Double> e) -> new BudgetEntity(userId, e.getKey(), e.getValue()))
                .toList();
        budgets.saveAll(newBudgets);

        return new ImportResult(newTransactions.size(), newBudgets.size());
    }
}