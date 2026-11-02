package com.niraj.backend;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class LoanService {

    private final LoanRepository repository;
    private final RepaymentRepository repayments;

    public LoanService(LoanRepository repository, RepaymentRepository repayments) {
        this.repository = repository;
        this.repayments = repayments;
    }

    public List<Loan> findAll(long userId) {
        Map<Long, List<RepaymentEntity>> byLoan = repayments.findByUserIdOrderById(userId).stream()
                .collect(Collectors.groupingBy(RepaymentEntity::getLoanId));
        return repository.findByUserIdOrderById(userId).stream()
                .map(l -> toLoan(l, byLoan.getOrDefault(l.getId(), List.of())))
                .toList();
    }

    public Loan create(long userId, LoanRequest request) {
        LoanEntity entity = new LoanEntity();
        entity.setUserId(userId);
        apply(entity, request);
        return toLoan(repository.save(entity), List.of());
    }

    @Transactional
    public Loan update(long userId, long id, LoanRequest request) {
        LoanEntity entity = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> notFound(id));
        if (request.amount() < repayments.totalForLoan(id) - 0.005) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Amount cannot be less than what is already repaid");
        }
        apply(entity, request);
        return toLoan(repository.save(entity), repayments.findByLoanIdOrderById(id));
    }

    @Transactional
    public void delete(long userId, long id) {
        LoanEntity entity = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> notFound(id));
        repayments.deleteAllForLoan(id);
        repository.delete(entity);
    }

    private void apply(LoanEntity entity, LoanRequest request) {
        entity.setDirection(request.direction());
        entity.setPerson(request.person().trim());
        entity.setAmount(request.amount());
        entity.setDate(request.date());
        entity.setDueDate(request.dueDate());
        entity.setNote(request.note());
    }

    private Loan toLoan(LoanEntity entity, List<RepaymentEntity> rows) {
        double repaid = rows.stream().mapToDouble(RepaymentEntity::getAmount).sum();
        return new Loan(
                entity.getId(),
                entity.getDirection(),
                entity.getPerson(),
                entity.getAmount(),
                repaid,
                entity.getDate(),
                entity.getDueDate(),
                entity.getNote(),
                rows.stream().map(Repayment::from).toList());
    }

    private ResponseStatusException notFound(long id) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Loan " + id + " not found");
    }
}