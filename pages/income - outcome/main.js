let activepage = document.querySelector(".navbar-nav .active");

activepage.addEventListener("click", (e) => {
    e.preventDefault();
})
////////
let inputDate = document.querySelector(".inputDate");
let allTransactions = getFromLocal("allTransactions");

let back = document.querySelector(".back");
let backSvg = ['fa-solid fa-hand-holding-dollar', 'fa-solid fa-money-bill-1-wave'];

let incomeDefault = `
        <div class="head fw-bold border-bottom pb-2 d-flex justify-content-between align-items-center">
            <section>حذف</section>
            <section>إسم الجهاز</section>
            <section>تفاصيل الايرادات</section>
            <section>الخصم</section>
            <section>السعر الاجمالي</section>
        </div>
`
let outcomeDefault = `
    <div class="head fw-bold border-bottom pb-2 d-flex justify-content-around align-items-center">
        <section>
            <button title="اضافه مصروفات" class="add-pay btn delete" onclick="addPayment()">إضافة</button>
        </section>
        <section>السعر</section>
        <section>الوصف</section>
        <section>الصنف</section>
    </div>
`
let dayIndex = -1;

let btnIncome = document.querySelector(".show-income");
let btnOutcome = document.querySelector(".show-outcome");
let tableData = document.querySelector(".data-table");

class PaymentTrans {
    constructor(type, details, price) {
        this.type = type;
        this.details = details;
        this.price = price;
    }
}

inputDate.defaultValue = inputDate.max = allTransactions[allTransactions.length - 1].date;
inputDate.min = allTransactions[0].date;

function getFromLocal(item) {
    return JSON.parse(window.localStorage.getItem(item)) || [];
}
function setToLocal(item, arr) {
    window.localStorage.setItem(item, JSON.stringify(arr));
}
function createData(arr, dataType = 'income') {
    if (dataType.toLowerCase() == 'outcome') {
        tableData.innerHTML = outcomeDefault;

        arr.forEach(({ type, details, price }, index) => {
            let temp = `
            <div class="head border-bottom pb-2 d-flex justify-content-around align-items-center">
                <section>
                    <button title="حذف مصروف" class="btn delete" onclick="deleteRec('outcome',${index})">حذف</button>
                </section>
                <section>${price} ج</section>
                <section class="long">${details}</section>
                <section>${type}</section>
            </div>
        `
            tableData.innerHTML += temp;
        })
    }
    else {
        tableData.innerHTML = incomeDefault;

        arr.forEach(({ name, bookTimeSalary, drinkSalary, discount }, index) => {
            let temp = `
            <div class="head border-bottom pb-2 d-flex justify-content-between align-items-center">
                <section>
                    <button title="حذف مصروف" class="btn delete" onclick="deleteRec('income',${index})">حذف</button>
                </section>
                <section>${name}</section>
                <section>
                    <button title="عرض تفاصيل الايرادات" class="btn show-details delete" onclick="showDetails(${index})">تفاصيل</button>
                </section>
                <section>${discount} ج</section>
                <section>
                    ${+bookTimeSalary + +drinkSalary - +discount} ج
                </section>
            </div>
            `

            tableData.innerHTML += temp;
        })

    }
}
function getDrinks(arr) {
    let x = arr.map((el) => {
        return el[1] + " " + el[0].name;
    }).join("  و ");

    return x;
}
btnIncome.addEventListener("click", showIncomeData);

function showIncomeData() {
    btnIncome.classList.add("ActiveBtn");
    btnOutcome.classList.remove("ActiveBtn");
    getIndexOfDay(inputDate.value);
    createData(allTransactions[dayIndex].devicesTrans);
    createSVG(backSvg[0]);
}
showIncomeData();

btnOutcome.addEventListener("click", () => {
    btnOutcome.classList.add("ActiveBtn");
    btnIncome.classList.remove("ActiveBtn");
    getIndexOfDay(inputDate.value)
    createData(allTransactions[dayIndex].payment, 'outcome');
    createSVG(backSvg[1]);

})
function getIndexOfDay(date) {
    allTransactions.some((day, index) => {
        dayIndex = index;
        return day.date == date;
    })
}
function deleteRec(type, index) {

    if (type == 'income') {
        allTransactions[dayIndex].devicesTrans.splice(index, 1);
        createData(allTransactions[dayIndex].devicesTrans, 'income');
    } else {
        allTransactions[dayIndex].payment.splice(index, 1);
        createData(allTransactions[dayIndex].payment, 'outcome');
    }
    setToLocal("allTransactions", allTransactions);
}
function addPayment() {
    new Promise((resolved) => {
        resolved(Swal.fire({
            title: 'إضافة مصروفات',
            html: `
                <input type="text" placeholder="ادخل اسم المصروفات" id="payName">
                <input type="text" placeholder="ادخل الوصف" id="payDesc">
                <input type="text" placeholder="ادخل السعر" id="payPrice">
            `,
            allowOutsideClick: false,
            showDenyButton: true,
            denyButtonText: 'الغاء',
            confirmButtonText: 'تشغيل',
            focusConfirm: false,
            preConfirm: () => {
                return [
                    document.querySelector("#payName").value,
                    document.querySelector("#payDesc").value,
                    document.querySelector("#payPrice").value,
                ]
            }
        })
        )
    }).then(({ isConfirmed, value: v }) => {
        if (isConfirmed) {
            if (v[0].length == 0 || v[2].length == 0) {
                Swal.fire('تأكد من ادخال كل البيانات')
            }
            else {
                let pay = new PaymentTrans(v[0], v[1], v[2]);
                allTransactions[allTransactions.length - 1].payment.push(pay);
                setToLocal("allTransactions", allTransactions);
                createData(allTransactions[allTransactions.length - 1].payment, 'outcome');
            }
        }
    })
}
function showDetails(index) {
    let { totalTime, type, bookTimeSalary, drinks, drinkSalary, discount } = allTransactions[dayIndex].devicesTrans[index];

    new Promise((resolved) => {
        resolved(Swal.fire({
            title: 'عرض إيرادات',
            html: `
            
            <div class="d-flex justify-content-between w-100 fw-bold">
                <section>
                    <p>الوقت المنقضي : 
                        <span>
                            ${totalTime / 60 > 1
                    ? `${Math.floor(totalTime / 60)} ساعه ${totalTime % 60 == 0
                        ? ""
                        : ` و ${totalTime % 60} دقيقه`
                    }`
                    : totalTime / 60 == 1
                        ? `60 دقيقه`
                        : `${totalTime % 60} دقيقه`}
                        </span>
                    </p>
                </section>
                
                <section>
                    <p>سعر الحجز : <span>${bookTimeSalary}</span> ج</p>
                </section>
            </div>

            <div class="d-flex justify-content-between w-100 fw-bold my-2">
                <section class="drinks">
                    <p>المشروبات : <span >${getDrinks(drinks)}</span></p>
                </section>
                
                <section>
                    <p>سعر الاوردارات : <span>${drinkSalary}</span> ج</p>
                </section>
            </div>

            <div class="d-flex justify-content-between w-100 fw-bold my-2">
                <section>
                    <p>
                        النوع : <span>${type == 'singleSalary' ? "فردي" : "زوجي"}</span>
                    </p>
                </section>
                
                <section>
                    <p>
                    السعر الاجمالي : <span>${+drinkSalary + +bookTimeSalary}</span> ج
                    </p>
                </section>
                
            </div>

           
            `,
            confirmButtonText: 'تم',
            focusConfirm: true,
        })
        )
    })
}
function createSVG(type) {
    let svg = document.createElement("i");
    svg.className = type;
    back.firstElementChild.remove();
    back.appendChild(svg);
}