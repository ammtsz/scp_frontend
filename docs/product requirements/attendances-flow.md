You are a senior software engineer who just started in this project. Take a deep look in the entire project, analyze the `diagram.html`, `scp.html` and `scp-implementation-strategy.md` files. After that, read the following lines and study the possibility of implementing all necessary changes in the project to achieve all this requirements, but DON'T IMPLEMENT anything yet.

The main point of this changes will be to organize better the code and responsibilities, since right now I feel like the components are sharing to much of responsibilities so it is hard to decide where to implement new features or even to make changes without breaking other parts of the code. Other business rules are to come, but to don't rush much, let's focus on the following rules for now.

Take a time to deep analyze all mentioned files and the entire code, then tell me what should be the next steps.

# Patient Form

On the first form (patient form) we will focus on patient personal data. This form should appear every time a NEW patient is dragged to checked-in column on the attendance page.

## Fields:

- Text: Name (Nome)
- Date: Birth date (Data de Nascimento)
- Text: Phone number (Telefone)
- Select: Priority (Prioridade)
- Select: Treatment Status (Status do Tratamento - options: T (em tratamento), A (alta médica espiritual), F (faltas consecultivas), N (novo paciente); we will have to add this new patient status "N" to the project and that will be the default status when creating a new patient until it is changed on treatment form)

### About the treatment status

N - new patient: when a new patient is registered
T - under treatment: after first consultation until the patient is dismissed by the doctor or has two consecutive faults without explanation
A - spiritual medical dismiss: after last attendance (on treatment form there will be a checkbox indicating that the patient was dismissed, when it is checked, the status must be changed to "A")
F - consecutive faults: when patient miss two appointments without justifying it. The faults will be registered in the attendance table on the database. We will need two columns for that, one to indicate a missing appointment and another to indicate if its a justified fault or not. The explanation can go on the notes field. Once the treatment status is changed to "F", all future attendances in spiritual consultation, lightbath and rod for this patient should be deleted

### Note 1 - extra data on submitting the patient form

Besides the fields above on patient form, we will also need other two data for the patient, one is already implemented in our backend, which is the id / registration number. The other is a new column on the patient table to keep tracking of missing appointments streak, this one needs to be implemented and the default value will be 0.

### Note 2 - scheduled and unscheduled patients

New patients that are scheduled should have been registered on backend once is has being scheduled through NewAttendanceForm component, and only two information must have been saved from the form: Name and Priority, and another two should be saved together by default: Treatment Status (as "N") and Missing Appointments Streak (as "0"), so when he checks-in on his/her first attendance, the patient form will allow the user to fill the rest of the patient data. On the other hand, if a NEW patient is unscheduled and checks-in, the patient form should be filled at this moment (we already have some form implemented for this occasion, but it should be revised to check that it attains all the requirements)

### Note 3 - edit mode

This form will have an edit mode so all the data can be updated later. The edit mode should be available on the patient's page.

# Treatment form

On the treatment form we will focus on the spiritual treatment itself (not bathlight nor rod) - this form should be filled right after the attendance of the patient on spiritual consultation is finished, so at this point we will have the information we need to indicate next steps for this patient (how often he/she needs to return, which treatment should be done, water, food, etc).

## Fields

- TextArea: Main complains (Principal Queixa)
- Select: Treatment Status (Status do Tratamento - options: N (novo paciente), T (em tratamento), A (alta médica espiritual), F (faltas consecultivas); this field should be prefilled based on the previous information about treatment status)
- Date: Date of attendance (Data da consulta (pre-filled with current day date))
- Date: Start date (Data de Início; field prefilled with current date if it is the first attendance and if it's not, field should be disabled, but displaying the correct starting date)
- Number: Return weeks (Semanas para retorno) (this will be the default for the patient, but it can be changed during the treatment, so if on the previous attendance this number has been updated, it should be prefilled on the next attendance). Once the form is submitted with return weeks filled, a new appointment for spiritual consultation must be automatically scheduled for this patient for the expected date based on the return weeks.
- Spiritual Medical Dismissed (Alta médica espiritual - checkbox that when checked, means the patient has been dismissed on that day and the patient status should be changed to dismissed, besides, all future attendances in spiritual consultation, lightbath and rod for this patient should be deleted)

### Recommendations section:

- Text: Food (Alimentação)
- Text: Water (Água)
- Text: Ointment (Pomada)
- Toggle: Lightbath (Banho de Luz)
- Toggle: Rod (Bastão)

### Note 4

This might be a little trick because until now we have been treating the spiritual consultation (or spiritual treatment - they are the same thing in our context) in the same hierarchy as the lightbath and rod treatments, but actually the spiritual consultation is higher in the hierarchy once the spiritual consultation is the main thing, and through this consultations the doctor will recommend some sections of lightbath and/or rod to help with the treatment. The lightbath and rod treatments are done by the same doctor, but a different one from the spiritual consultation doctor. Although, just like the spiritual consultation, the lightbath and rod treatment also have a recurrence that might occur on the same day of the spiritual consultation, so we need to keep track of all of them, which means we might need update our database tables (I'll give more details below).

### Important note about Lightbath and Rod:

When lightbath (Banho de luz) and/or rod (bastão) is toggled to true, a new section of the form should appear right above the toggled treatment to allow the user to add extra data about the lightbath or rod treatment. The following fields should appear:

- For lightbath: start date (data de início), body location (local do corpo), color (cor), duration in minutes (tempo), amount (quantidade);

- For rod: start date (data de início), body location (local do corpo) and amount (quantidade).

After filling all the fields, a button to add another body location should appear for each section, and when clicked, it should show the same fields (for lightbath: start date, body location, color, duration, amount; and for rod: start date, body location and amount)

Once those treatment data is filled and submitted, the system should automatically schedule all the lightbath and/or rod sections according to the start date and amount filled in the form. Each sections is separated by a week, always on tuesdays. So if the amount for lightbath is 2 and the start date is today (suppose today is tuesday), so a section for today should be automatically scheduled but also another section for the following tuesday.

# End of the attendance day

We will also create a button on attendance page called "Finalizar dia de atendimentos". By the end of the attendance day, when it is clicked, we should check if all patients is in the completed column, if there are any in checked-in or ongoing columns, we show a modal message asking the user to complete the flow for those patients or move them back to scheduled columns. If there are no patients on checked-in nor ongoing columns, but there are on scheduled columns, we will open a modal with all the patients that were scheduled and missed the appointment and one by one the user will be able to justify the absence of the patient or not and a not justified absence will count on the missing appointments streak. On the other hand, if all patients is on the completed column, we can end the day by saving on backend the correct value for missing appointment column for each patient, then disabling the drag and drop and writing a message similar to: "Consultas finalizadas às 23h10 do dia 26 de agosto de 2025".

# Final considerations

To manage all scheduling fot spiritual consultation, lightbath treatment and rod treatment, we will rely in a agenda module that we already started implementing, but needs a lot more improvements that we can study if it is better to do before, during or after implements the changes above.
