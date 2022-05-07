let activepage = document.querySelector(".navbar-nav .active");

activepage.addEventListener("click", (e) => {
    e.preventDefault();
})
// remove event because iam already in this page

let btnStartDevice = document.querySelector(".landing .start-device");
let btnNewDay = document.querySelector(".landing .new-day");
let devices; // get all devices from local
let runDevices; // get all Devices running right now
let allTransactions = getFromLocal("allTransactions");


class deviceRunTemp {
    // Devices Running Template
    constructor(name, time, type, price) {
        this.name = name;
        this.bookTime = time;
        this.totalTime = time;
        this.type = type;
        this.hourPrice = price;
        this.timeStart = Date.now();
        this.finish = false;
        this.bookTimeSalary = 0;
        this.drinks = [];
        this.drinkSalary = 0;
        this.discount = 0;
        this.prepaid = false;
    }
}

class TransactionTemp {
    // temp
    constructor(payment, DevicesTrans) {
        this.date = yyyymmdd(new Date()); // Date Of The Day >> Date
        this.payment = payment; // all Payments In That Day >> []
        this.devicesTrans = DevicesTrans; // all devices Transtion >> []
    }
}

// check All Transaction Existence first time
if (allTransactions.length == 0) {
    allTransactions = [];
    allTransactions.push(new TransactionTemp([], []));
    setToLocal("allTransactions", allTransactions);
}
btnStartDevice.addEventListener("click", _ => { // Set Data for New Device
    new Promise((resolved) => {
        resolved(Swal.fire({
            title: 'تشغيل جهاز',
            html: `
                    <select class="select-device w-100 mb-3 px-3 py-1">
                        <option selected disabled hidden value="">اختر جهاز</option>
                        ${setDevices()}
                    </select>

                    <select class="select-time w-100 mb-3 px-3 py-1">
                        <option selected hidden disabled value="">اختار الوقت</option>    
                        <option value="openTime">مفتوح</option>
                        <option value="1">1 دقيقه</option>
                        <option value="15">15 دقيقه</option>
                        <option value="30">30 دقيقه</option>
                        <option value="60">60 دقيقه</option>
                        <option value="90">90 دقيقه</option>
                        <option value="120">120 دقيقه</option>
                        <option value="150">150 دقيقه</option>
                        <option value="180">180 دقيقه</option>
                    </select>

                    <select class="select-type  w-100 px-3 py-1">
                        <option selected disabled hidden value="">اختار النوع</option>    
                        <option value="singleSalary">فردي</option>
                        <option value="multiSalary">زوجي</option>
                    </select>
                `,
            allowOutsideClick: false,
            showDenyButton: true,
            denyButtonText: 'الغاء',
            confirmButtonText: 'تشغيل',
            focusConfirm: false,
            preConfirm: () => {
                return [
                    document.querySelector(".select-device").value,
                    document.querySelector(".select-time").value,
                    document.querySelector(".select-type").value,
                ]
            }
        })
        )
    }).then(({ isConfirmed, value: v }) => {
        if (isConfirmed) {
            if (v.indexOf('') != -1) {
                Swal.fire('تأكد من اختيار كل البيانات')
            }
            else {
                // We will Do Here Script
                //  ['0', '1', 'multi']
                let rundevice = new deviceRunTemp(devices[+v[0]].name, v[1], v[2], devices[+v[0]][v[2]]);
                runDevices.push(rundevice);
                setToLocal("devicesRunning", runDevices);
            }
        }
    })
});
btnNewDay.addEventListener("click", (e) => {
    let x = yyyymmdd(new Date);
    if (allTransactions[allTransactions.length - 1].date == x) {
        Swal.fire(
            'يوم جديد',
            `أنت بالفعل في يوم جديد ${x}`,
            'info'
        );
    }
    else {
        allTransactions.push(new TransactionTemp([], []));
        setToLocal("allTransactions", allTransactions);
        Swal.fire(
            'لقد بدأت يوم جديد',
            `${x}`,
            'success'
        ).then((_)=> window.Location = './');
    }
});
function getFromLocal(item) {
    return JSON.parse(window.localStorage.getItem(item)) || [];
}
function setToLocal(item, arr) {
    window.localStorage.setItem(item, JSON.stringify(arr));
}
function setDevices() { // set devices available
    devices = getFromLocal("devices"); // get all devices from local
    runDevices = getFromLocal("devicesRunning"); // get all Devices running right now

    devices = devices.filter((device) => { // return only devices not running
        return !runDevices.some((runDevice) => runDevice.name == device.name);
    });

    let Fragment = '';

    Fragment.innerHTMl = `<option selected disabled hidden value="">اختر جهاز</option>
    `
    for (const device of Object.entries(devices)) {
        let Opt = `<option value="${device[0]}">${device[1].name}</option>`;
        Fragment += Opt;
    }
    return Fragment;
}
function yyyymmdd(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
        }-${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}`;
}
let dayMonth = getMonth_(allTransactions[allTransactions.length - 1].date);

setSalaries();
function setSalaries() {
    let sumPerMonth = 0,
        sumPerMonthOut = 0;
    for (
        let el = allTransactions.length - 1;
        allTransactions[el] && el >= allTransactions.length - 30;
        el--
    ) {
        let { devicesTrans, payment } = allTransactions[el];

        sumPerMonth += devicesTrans.reduce((ac, { bookTimeSalary, drinkSalary, discount }) => {
            // sum all Salaries in var
            // Loop On Devices Tranasation And Calc Sum Of All Salary At This Day
            return ac + +bookTimeSalary + +drinkSalary - +discount;
        }, 0);

        sumPerMonthOut += payment.reduce((ac, { price }) => {
            // sum all Salaries in var
            // Loop On Devices Tranasation And Calc Sum Of All Salary At This Day
            return ac + +price;
        }, 0);

        if (el == allTransactions.length - 1) {
            // Current Day print it's value
            document.querySelector(".totalInDay").textContent = sumPerMonth;
        }
        // // Check the yesterday in the current month of today
        if (dayMonth == getMonth_(allTransactions[el].date)) {
            document.querySelector(".totalIncomePerMonth").textContent = +sumPerMonth - +sumPerMonthOut;
            document.querySelector(".totalPaymentPerMonth").textContent = sumPerMonthOut;

        } else {
            // last month reaches
            return;
        }
    }
}
function getMonth_(date) {
    return new Date(date).getMonth();
}
