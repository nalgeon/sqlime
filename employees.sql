create table employees (
    id integer primary key,
    name varchar(50),
    city varchar(50),
    department varchar(50),
    salary integer
);

insert into employees
(id, name, city, department, salary)
values
(11, 'Diane', 'London', 'hr', 70),
(12, 'Bob', 'London', 'hr', 78),
(21, 'Emma', 'London', 'it', 84),
(22, 'Grace', 'Berlin', 'it', 90),
(23, 'Henry', 'London', 'it', 104),
(24, 'Irene', 'Berlin', 'it', 104),
(25, 'Frank', 'Berlin', 'it', 120),
(31, 'Cindy', 'Berlin', 'sales', 96),
(32, 'Dave', 'London', 'sales', 96),
(33, 'Alice', 'Berlin', 'sales', 100);

create table expenses (
    year integer,
    month integer,
    income integer,
    expense integer
);

insert into expenses
(year, month, income, expense)
values
(2020, 1, 94, 82),
(2020, 2, 94, 75),
(2020, 3, 94, 104),
(2020, 4, 100, 94),
(2020, 5, 100, 99),
(2020, 6, 100, 105),
(2020, 7, 100, 95),
(2020, 8, 100, 110),
(2020, 9, 104, 104);