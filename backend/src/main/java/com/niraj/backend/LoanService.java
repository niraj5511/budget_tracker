package com.niraj.backend;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class LoanService {

    private final LoanRepository repository;

    public LoanService(LoanRepository repository) {
        this.repository = repository;
    }

    public List<Loan> findAll(long userId) {
        return repository.findByUserIdOrderById(userId).stream().map(this::toLoan).toList();
    }

    public Loan create(long userId, LoanRequest request) {
        LoanEntity entity = new LoanEntity();
        entity.setUserId(userId);
        apply(entity, request);
        return toLoan(repository.save(entity));
    }

    public Loan update(long userId, long id, LoanRequest request) {
        LoanEntity entity = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> notFound(id));
        apply(entity, request);
        return toLoan(repository.save(entity));
    }

    public void delete(long userId, long id) {
        LoanEntity entity = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> notFound(id));
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

    private Loan toLoan(LoanEntity entity) {
        return new Loan(
                entity.getId(),
                entity.getDirection(),
                entity.getPerson(),
                entity.getAmount(),
                entity.getDate(),
                entity.getDueDate(),
                entity.getNote());
    }

    private ResponseStatusException notFound(long id) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Loan " + id + " not found");
    }
}