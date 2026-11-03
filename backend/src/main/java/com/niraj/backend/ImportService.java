package com.niraj.backend;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ImportService {

    public record ImportResult(int transactions, int budgets, int loans) {
    }

    private final TransactionRepository transactions;
    private final BudgetRepository budgets;
    private final LoanRepository loans;
    private final RepaymentRepository repayments;

    public ImportService(TransactionRepository transactions, BudgetRepository budgets,
            LoanRepository loans, RepaymentRepository repayments) {
        this.transactions = transactions;
        this.budgets = budgets;
        this.loans = loans;
        this.repayments = repayments;
    }

    // One database transaction: if anything throws, every delete is rolled back too.
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

        // Repayments go first because they point at loans.
        int loanCount = 0;
        if (request.loans() != null) {
            repayments.deleteAllForUser(userId);
            loans.deleteAllForUser(userId);
            for (ImportLoan item : request.loans()) {
                saveLoan(userId, item);
            }
            loanCount = request.loans().size();
        }

        return new ImportResult(newTransactions.size(), newBudgets.size(), loanCount);
    }

    private void saveLoan(long userId, ImportLoan item) {
        double repaid = item.repayments().stream().mapToDouble(RepaymentRequest::amount).sum();
        if (repaid > item.amount() + 0.005) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Repayments are more than the loan amount");
        }

        LoanEntity loan = new LoanEntity();
        loan.setUserId(userId);
        loan.setDirection(item.direction());
        loan.setPerson(item.person().trim());
        loan.setAmount(item.amount());
        loan.setDate(item.date());
        loan.setDueDate(item.dueDate());
        loan.setNote(item.note());
        LoanEntity saved = loans.save(loan);

        for (RepaymentRequest r : item.repayments()) {
            RepaymentEntity repayment = new RepaymentEntity();
            repayment.setUserId(userId);
            repayment.setLoanId(saved.getId());
            repayment.setAmount(r.amount());
            repayment.setDate(r.date());
            repayment.setNote(r.note());
            repayments.save(repayment);
        }
    }
}