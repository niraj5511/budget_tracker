package com.niraj.backend;

public record Repayment(long id, double amount, String date, String note) {

    static Repayment from(RepaymentEntity e) {
        return new Repayment(e.getId(), e.getAmount(), e.getDate(), e.getNote());
    }
}