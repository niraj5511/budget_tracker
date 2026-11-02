package com.niraj.backend;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RepaymentService {

    private final LoanRepository loans;
    private final RepaymentRepository repayments;

    public RepaymentService(LoanRepository loans, RepaymentRepository repayments) {
        this.loans = loans;
        this.repayments = repayments;
    }

    @Transactional
    public Repayment create(long userId, long loanId, RepaymentRequest request) {
        LoanEntity loan = loans.findByIdAndUserId(loanId, userId)
                .orElseThrow(() -> notFound("Loan " + loanId));

        double outstanding = loan.getAmount() - repayments.totalForLoan(loanId);
        if (request.amount() > outstanding + 0.005) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Repayment is more than the outstanding amount");
        }

        RepaymentEntity entity = new RepaymentEntity();
        entity.setUserId(userId);
        entity.setLoanId(loanId);
        entity.setAmount(request.amount());
        entity.setDate(request.date());
        entity.setNote(request.note());
        return Repayment.from(repayments.save(entity));
    }

    @Transactional
    public void delete(long userId, long loanId, long id) {
        RepaymentEntity entity = repayments.findByIdAndLoanIdAndUserId(id, loanId, userId)
                .orElseThrow(() -> notFound("Repayment " + id));
        repayments.delete(entity);
    }

    private ResponseStatusException notFound(String what) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, what + " not found");
    }
}