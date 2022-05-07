let activepage = document.querySelector(".navbar-nav .active");

activepage.addEventListener("click", (e) => {
    e.preventDefault();
});
/////
let _alert = document.querySelector(".alert");
let deviceRunning = getFromLocal("devicesRunning");
let contentHolder = document.querySelector(".content");
let ID_Interval = [];
let Drinks = [];
let allTransactions = getFromLocal("allTransactions");

function getFromLocal(item) {
    return JSON.parse(window.localStorage.getItem(item)) || [];
}
function setToLocal(item, arr) {
    window.localStorage.setItem(item, JSON.stringify(arr || []));
}
window.setTimeout(()=>window.location = './index.html',(1000 * 60 * 10));
createDevices();
function createDevices() {
    do {
        clearInterval(ID_Interval[0]);
        ID_Interval.shift();
    } while (!(ID_Interval.length == 0))

    contentHolder.innerHTML = ''
    deviceRunning.forEach(
        (
            {
                name,
                bookTime,
                totalTime,
                type,
                timeStart,
                finish,
                drinks,
                bookTimeSalary,
                drinkSalary,
                discount,
                prepaid
            },
            index
        ) => {
            let temp = `
            <div class="device ${finish ? 'finish' : ''} text-white p-3 rounded-3 ">
                <div class="d-flex justify-content-around align-items-center">
                    <h1 class="name">${name}</h1>
                    <section>
                        <i class="fa-solid fa-x py-2 px-3 btn" onclick="deleteDevice(${index})"></i>
                        <input class="check btn" title="مسبق الدفع" ${prepaid ? 'checked' : ''} type="checkbox" onclick="prePaid(${index})">
                    </section>
                </div>
                <section class="time-pass mt-3">
                    <label class="mb-2 fs-6">
                    ${bookTime == "openTime" ? "الوقت المنقضي" : "الوقت المتبقي"
                }
                    </label>
                    <div class="time-interval d-flex justify-content-between align-item-center">
                        <p><span></span> : ساعة</p>
                        <p><span></span> : دقيقة</p>
                        <p><span></span> : ثانية</p>
                    </div>
                </section>
                <div class="custRow d-flex justify-content-between align-items-center mt-3">
                    <section class="time-start">
                        <label class="mb-2 fs-6">وقت البدء</label>
                        <p class="d-block">${getTime(
                    new Date(timeStart).toLocaleTimeString()
                )}</p>
                    </section>
                    <section class="time-booked">
                        <label class="mb-2 fs-6">
                            ${finish
                    ? `الوقت المنقضي`
                    : bookTime == "openTime"
                        ? ""
                        : `الوقت المحجوز`
                }
                        </label>
                        <p>
                        ${!finish
                    ? bookTime == "openTime"
                        ? ""
                        : totalTime / 60 > 1
                            ? `${Math.floor(totalTime / 60)} ساعه ${totalTime % 60 == 0
                                ? ""
                                : ` و ${totalTime % 60} دقيقه`
                            }`
                            : totalTime / 60 == 1
                                ? `1 ساعة`
                                : `${totalTime % 60} دقيقه`
                    : totalTime / 60 > 1
                        ? `${Math.floor(totalTime / 60)} ساعه ${totalTime % 60 == 0
                            ? ""
                            : ` و ${totalTime % 60} دقيقه`
                        }`
                        : totalTime / 60 == 1
                            ? `60 دقيقه`
                            : `${totalTime % 60} دقيقه`
                }
                        </p>
                    </section>
                    ${finish
                    ? ` <section class="time-booked">
                        <label class="total-salary mb-2 fs-6">السعر الاجمالي</label>
                        <p>
                        ${+drinkSalary + +bookTimeSalary - +discount} ج
                        </p>
                    </section>`
                    : ""
                }
                </div>
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <section class="device-type">
                        <label class="mb-2 fs-6">نوع الجهاز</label>
                        <p class="d-block">
                        ${type == "singleSalary" ? "فردي" : "زوجي"}
                        </p>
                    </section>
                    <section class="drinks">
                    ${drinks.length
                    ? `              
                        <details class="drinks">
                            <summary class="mb-2 fs-6">المشروبات</summary>
                            <p class>
                                ${getDrinks(index)}
                            </p>
                        </details>`
                    : ""
                }
                    </section>
                </div>
                <div class="btns d-flex justify-content-between align-items-center mt-4">
                    <button class="btn" title="إيقاف" onclick="stopDevice(${index})">إيقاف</button>
                    <button class="btn" title="خصم" onclick="setDiscount(${index})">خصم</button>
                    <button class="btn" title="اضافة مشروب" onclick="addDrink(${index})">اضافة مشروب</button>
                    <button class="btn" title="إضافة وقت" onclick="overTime(${index})">إضافة وقت</button>
                </div>
            </div>
        `;
            contentHolder.innerHTML += temp;
        }
    );


    ID_Interval = Array.from(
        document.querySelectorAll(".content .device .time-interval")
    ).map((device, index) => {
        return remainderTime(
            device,
            deviceRunning[index].bookTime,
            deviceRunning[index].timeStart,
            index
        );
    });

    if (contentHolder.innerHTML == '') {
        Swal.fire(
            "ليس هناك اجهزه شغاله",
            'question'
        );
    }
}
function getTime(x) {
    let xx = x.toString().split("");
    xx.splice(4, 3);
    xx[5] = `${xx[5]}${xx[6]}` == "AM" ? "ص" : "م";
    xx.length = 6;
    return xx.join("");
}
function remainderTime(Box, bookTime, timeStart, index) {
    let hours = Box.firstElementChild.firstElementChild; // hours
    let minutes = Box.firstElementChild.nextElementSibling.firstElementChild; // minutes
    let seconds = Box.lastElementChild.firstElementChild; // sec

    if (deviceRunning[index].finish) {
        // reset All Fields To 0
        hours.textContent = 0;
        seconds.textContent = 0;
        minutes.textContent = 0;
        clearInterval(ID_Interval[index]);
        return -1;
    }
    let Id; // For Intervals

    let diff = Date.now() - +timeStart;

    hours.textContent = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    minutes.textContent = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    seconds.textContent = Math.floor((diff % (1000 * 60)) / 1000);

    if (bookTime == "openTime") {
        Id = setInterval(() => {
            seconds.textContent = +seconds.textContent + 1;
            if (+seconds.textContent >= 59) {
                // If Seconds Reaches 59

                seconds.textContent = 0; // reset 0 to starts again
                minutes.textContent = +minutes.textContent + 1; // add 1 to minutes field

                if (+minutes.textContent >= 59) {
                    // if Minutes Reaches 59

                    minutes.textContent = 0; // reset it
                    hours.textContent = +hours.textContent + 1; // add 1 to Hours Field
                }
            }
        }, 1000);
    } else {
        hours.textContent = Math.floor(+bookTime / 60) - +hours.textContent; // Calc Hours
        // If Hours is 1 Thats Mean We Don't Need To Hours Field we will put It to 0
        // And put 60 to Minutes Field [blew]

        minutes.textContent =
            (+bookTime % 60 || (+hours.textContent-- && 60)) - +minutes.textContent;

        if (+minutes.textContent < 0) {
            minutes.textContent = 60 + +minutes.textContent;
            hours.textContent--;
        }
        // Get Remainder After Divide On 60 That's Minutes
        // if Remaineder 0 That's Mean No Minutes
        // He Choose Hours And Multiples for That We Will Put 60 to Minutes Field And decrement hours by 1

        Id = setInterval(() => {
            seconds.textContent -= 1;

            if (+minutes.textContent <= -1 || +hours.textContent <= -1) {
                // That Mean time up
                timeFinish(index, Id);
            }

            if (seconds.textContent <= 0) {
                // If Seconds Reaches 0
                seconds.textContent = 59; // reset it to 60 to Starts Again
                minutes.textContent -= 1;

                if (minutes.textContent <= -1) {
                    // If Minutes Reaches 0
                    minutes.textContent = 59; // reset It 60
                    hours.textContent -= 1; // minus 1 from hours

                    // Here we will Check If Hours == -1 Thats mean Now Time Remained
                    // we Will Stop That Interval And Call Func To Alert User
                    if (+hours.textContent <= -1) {
                        timeFinish(index, Id);
                    }
                }
            }
        }, 1000);
    }

    return Id;
}
function timeFinish(index, Id) {
    calcSalary(index);
    let { name, bookTimeSalary, drinkSalary, discount } = deviceRunning[index];

    const Salary = +bookTimeSalary + +drinkSalary - +discount;

    clearInterval(Id); //Clear Interval

    new Promise((resolve) => {
        _alert.play();
        resolve(
            Swal.fire({
                title: `جهاز ${name}`,
                html: `
                    <div class="Alert">
                    <p>انتهي الوقت</p>
                    <p>الحساب : ${Salary}ج</p>
                    </div>
                    `,
                allowOutsideClick: false,
            })
        );
    }).finally(() => {
        deviceRunning[index].finish = true;
        _alert.pause();
        setToLocal('devicesRunning', deviceRunning);
        createDevices();
    });
}
function getDrinks(index) {
    let x = deviceRunning[index].drinks
        .map((el) => {
            return el[1] + " " + el[0].name;
        })
        .join("  و ");

    return x;
}
function calcSalary(index) {
    let { hourPrice, totalTime, drinks } = deviceRunning[index];

    deviceRunning[index].drinkSalary = 0;

    drinks.forEach((el) => {
        deviceRunning[index].drinkSalary += +el[0].price * +el[1];
    });

    deviceRunning[index].bookTimeSalary = Math.round((+hourPrice / 60) * +totalTime);
}
function deleteDevice(index) {
    if (deviceRunning[index].finish) {
        Swal.fire({
            title: `حذف جهاز ${deviceRunning[index].name}`,
            showDenyButton: true,
            confirmButtonText: 'موافق',
            denyButtonText: 'الغاء',
            allowOutsideClick: false,
            customClass: {
                actions: 'my-actions',
                confirmButton: 'order-2 swal2-confirm',
                denyButton: 'order-3',
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire('تم حذف الجهاز', '', 'success').then(_ => {

                    allTransactions[allTransactions.length - 1].devicesTrans.push(deviceRunning.splice(index, 1)[0]);
                    // ADD DELETED DEVICE FROM RUNNING DEVICES TO ALL TRANSACTIONS

                    setToLocal("allTransactions", allTransactions);
                    setToLocal("devicesRunning", deviceRunning);
                    createDevices();
                })
            } else if (result.isDenied) {
                Swal.fire('لم يتم الحذف', '', 'info')
            }
        })
    }
    else {
        Swal.fire('يجب عليك ايقاف الجهاز اولاً');
    }

}
function overTime(index) {
    if (deviceRunning[index].bookTime != 'openTime') {
        Swal.fire({
            input: 'number',
            inputLabel: 'اضافة وقت',
            inputPlaceholder: 'ادخل الوقت',
            showDenyButton: true,
            denyButtonText: 'الغاء',
            confirmButtonText: 'اضافة',
            customClass: {
                confirmButton: 'swal2-confirm',
            },
            inputValidator: (v) => {
                if (!v) {
                    return 'يجب ادخال قيمة'
                }
            },
            allowOutsideClick: false
        }).then((v) => {
            if (v.isConfirmed) {

                if (!deviceRunning[index].finish) {
                    // current interval running
                    deviceRunning[index].bookTime = +deviceRunning[index].bookTime + +v.value || 0;
                } else {
                    // if not
                    deviceRunning[index].bookTime = +v.value || 0; // add new value
                    deviceRunning[index].timeStart = Date.now(); // set time starts
                    deviceRunning[index].finish = false; // make finish to false
                }

                deviceRunning[index].totalTime =
                    +deviceRunning[index].totalTime + +v.value; // add new value to total time

                setToLocal('devicesRunning', deviceRunning);
                createDevices();

            }
        })
    } else {
        Swal.fire('الجهاز وقت مفتوح لا يمكن اضافة وقت')
    }

}
function setDiscount(index) {
    Swal.fire({
        input: 'number',
        inputLabel: 'اضافة خصم',
        inputPlaceholder: 'ادخل قيمة الخصم',
        showDenyButton: true,
        denyButtonText: 'الغاء',
        confirmButtonText: 'خصم',
        customClass: {
            confirmButton: 'swal2-confirm',
        },
        inputValidator: (v) => {
            if (!v) {
                return 'يجب ادخال قيمة'
            }
        },
        allowOutsideClick: false
    }).then((v) => {
        if (v.isConfirmed) {
            deviceRunning[index].discount = v.value;
            setToLocal('devicesRunning', deviceRunning);
            createDevices();
        }
    });
}
function stopDevice(index) {
    Swal.fire({
        title: `هل تريد إيقاف تشغيل جهاز ${deviceRunning[index].name}`,
        showCancelButton: true,
        cancelButtonText: 'الغاء',
        confirmButtonText: 'إيقاف',
        customClass: {
            confirmButton: 'swal2-confirm',
        },
        allowOutsideClick: false
    }).then((v) => {
        if (v.isConfirmed) {
            let time = Array.from(document.querySelectorAll(".time-interval"));
            let hours = +time[index].firstElementChild.firstElementChild.textContent;
            let minute =
                +time[index].firstElementChild.nextElementSibling.firstElementChild
                    .textContent;

            let timeout = +hours * 60 + +minute; // Calc Time Reach

            if (deviceRunning[index].bookTime == "openTime") {
                deviceRunning[index].totalTime = +timeout; // In open Time timeout Is The totalTime
            } else {
                // otherwise time out it's time that user doesn't use it
                // So We Subtract it with totalTime to get time that user use.
                deviceRunning[index].totalTime = +deviceRunning[index].totalTime - +timeout;
            }
            calcSalary(index);
            let { totalTime, drinkSalary, bookTimeSalary, discount } = deviceRunning[index];

            Swal.fire({
                html: `
                    <p>الوقت المنقضي ${totalTime / 60 >= 1
                        ? `${Math.floor(totalTime / 60)} ساعه ${totalTime % 60 == 0
                            ? ""
                            : ` و ${totalTime % 60} دقيقه`
                        }`
                        : `${totalTime % 60} دقيقه`
                    }   
                    
                    </p>
                    <p>السعر : ${+drinkSalary + +bookTimeSalary - +discount
                    } ج
                    </p>
                `
            }).then((_) => {
                if (!deviceRunning[index].finish) {
                    // if elready finish we don't need to update data in local
                    deviceRunning[index].finish = true;
                    setToLocal('devicesRunning', deviceRunning);
                    createDevices();
                }
            })
        }
    });
}
function addDrink(index) {
    Drinks = getFromLocal("Products"); // Get Drinks From Local

    let drinks = {};

    if (Drinks.length) {
        Drinks.forEach((el) => {
            drinks[el.name] = {
                [el.name]: `السعر : ${el.price}`,
            };
        });

        new Promise((resolved) => {
            resolved(
                Swal.fire({
                    title: "اختار المنتج",
                    input: "select",
                    inputOptions: drinks,
                    inputPlaceholder: "اختار المنتج",
                    showCancelButton: true,

                    cancelButtonText: "الغاء",
                    confirmButtonText: "اختيار",
                    allowOutsideClick: false,

                    inputValidator: (value) => {
                        return new Promise((resolve) => {
                            if (value) {
                                resolve();
                            } else {
                                resolve("يجب عليك اختيار منتج :)");
                            }
                        });
                    },
                })
            );
        }).then((v) => {
            if (v.value) {
                Swal.fire({
                    title: `المنتج الذي اخترته : ${v.value}`,
                    input: "number",
                    inputLabel: "ادخل الكميه",
                    customClass: {
                        inputLabel: 'label-input'
                    },
                    showCancelButton: true,
                    cancelButtonText: "الغاء",
                    allowOutsideClick: false,
                    confirmButtonText: "موافق",
                    inputValidator: (value) => {
                        if (!value) {
                            return "يجب ان تقم بادخال قيمه !!";
                        }
                    },
                }).then((qua) => {
                    if (qua.value) {
                        let x = Drinks.filter((el) => el.name == v.value);

                        let existDrink = deviceRunning[index].drinks.some(
                            (el) => el[0].name == v.value
                        );
                        if (!existDrink) {
                            deviceRunning[index].drinks.push([x[0], qua.value]);
                        } else {
                            let ind;
                            deviceRunning[index].drinks.forEach((el, index) => {
                                if (el[0].name == v.value) {
                                    ind = index;
                                }
                            });

                            deviceRunning[index].drinks[ind][1] =
                                +deviceRunning[index].drinks[ind][1] + +qua.value;
                        }

                        // Calc Drinks Salary
                        calcSalary(index);

                        setToLocal("devicesRunning", deviceRunning);
                        createDevices();
                    }
                });
            }
        });
    } else {
        alert("قم باضافه بعض المشاريب");
    }
}
function prePaid(index) {
    deviceRunning[index].prepaid = !deviceRunning[index].prepaid;

    setToLocal("devicesRunning", deviceRunning);
    createDevices();
}