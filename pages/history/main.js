let activepage = document.querySelector(".navbar-nav .active");

activepage.addEventListener("click", (e) => {
    e.preventDefault();
})
////////
let inputDate = document.querySelector(".inputDate");
let allTransactions = getFromLocal("allTransactions");

let tableData = document.querySelector(".data-table");

inputDate.max = allTransactions[allTransactions.length - 1].date;
inputDate.min = allTransactions[0].date;

function getFromLocal(item) {
    return JSON.parse(window.localStorage.getItem(item)) || [];
}
function setToLocal(item, arr) {
    window.localStorage.setItem(item, JSON.stringify(arr));
}
function defaultDisplay() {
    let temp = [...allTransactions].reverse();
    createData(temp, true)
}
defaultDisplay();

function createData(arr, default_ = false) {
    let Fragment = '';
    Fragment += `
    <div class="head fw-bold border-bottom pb-2 d-flex justify-content-between align-items-center">
        <section title="المصروفات" >المصروفات</section>
        <section title="إيراد الاجهزه" > إيراد الاجهزه </section>
        <section title="إيراد الاوردرات">إيراد الاوردرات</section>
        <section title="الخصم">الخصم</section>
        <section title="صافي الدخل">صافي الدخل</section>
        ${default_
            ? `<section title="التاريخ">التاريخ</section>`
            : ''
        }
    </div>
`;

    arr.forEach(({ devicesTrans, payment, date }) => {
        let result = getSalaries(payment, devicesTrans);

        Fragment += `
        <div class="head fw-bold border-bottom pb-2 d-flex justify-content-between align-items-center">
            <section>${result[0]} ج</section>
            <section>${result[1]} ج</section>
            <section>${result[2]} ج</section>
            <section>${result[3]} ج</section>
            <section>
                ${+result[1] + +result[2] - +result[3] - +result[0]} ج
            </section>
            ${default_ ? `<section>${date}</section>`
                : ''
            }
        </div>
        `;
    });

    tableData.innerHTML = Fragment;
}
function getSalaries(payment, devicesTrans) {
    let incomeSum = 0,
        discountSum = 0,
        incomeDrinksSum = 0;

    let paymentsSum = payment.reduce((ac, { price }) => ac + +price
        , 0);

    devicesTrans.forEach(({ bookTimeSalary, discount, drinkSalary }) => {
        incomeSum += +bookTimeSalary;
        incomeDrinksSum += +drinkSalary;
        discountSum += +discount;
    });

    return [paymentsSum, incomeSum, incomeDrinksSum, discountSum];
}

function getIndexOfDay(date) {
    let dayIndex = -1,
        dayExist = allTransactions.some((day, index) => {
            dayIndex = index;
            return day.date == date;
        });
    return dayExist ? dayIndex : -1;
}
inputDate.addEventListener("change", () => {
    let index = getIndexOfDay(inputDate.value);
    
    +index != -1 ? createData([allTransactions[index]])
    : Swal.fire("اليوم الذي تريده ليس به تفاعلات")
    
})