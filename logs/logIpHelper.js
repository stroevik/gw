// ==UserScript==
// @name          [Special] Ip archive
// @include		  http://www.gwars.ru/special.iparchive.php*
// @include		  http://www.gwars.ru/special.iplog.php*
// @version       1.1.0
// @author        Bl(a)de
// @grant         none
// ==/UserScript==


(function () {
    'use strict';
    $(document).ready(function () {
        var Settings = function () {
            this.root = this.getRoot();
            this.store = this.getStore(this.root.localStorage);
            this.head = this.getHead();
            this.body = this.getBody();
            this.usersStoreKey = 'isksUsers';
        };

        Settings.prototype = {
            getRoot: function () {
                return typeof unsafeWindow !== "undefined" ? unsafeWindow : window
            },

            getStore: function (storage) {
                return new Disk(storage);
            },

            getHead: function () {
                return $('head');
            },

            getBody: function () {
                return $('body');
            },

            isLoadJQuery: function () {
                return typeof this.root.jQuery !== "undefined";
            },

            includeBS: function () {
                this.head.prepend('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">').prepend('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">');
                $.getScript("https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.11.0/umd/popper.min.js", function () {
                    $.getScript("https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js");
                });
            },

            initCustomStyles: function() {
                var content = '';
                content += '#page-loader {position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.45); z-index: 9999; display: none;}';
                content += '#page-loader i {position: fixed; top: 50%; left: 50%; margin: -28px 0 0 -28px;}';
                content += '#notify-container {position: fixed; bottom: 15px; right: 15px; display: none; font-weight: bold; color: rgb(255, 255, 255); z-index: 9999;}';
                content += '.btn-group .dropdown-item {font-size: 0.85rem; padding: 0.25rem 0.5rem; }';
                content += '#wrench-btn-group {position: fixed; bottom: 15px; left: 15px; }';
                content += '#wrench-btn-group .dropdown-menu {background: none; }';
                content += '#work-panel {}';
                content += '#work-panel .form-control { border-color: #ced4da; font-size: 0.75rem; }';
                content += '#work-panel .btn { font-size: 0.75rem; }';
                content += '#work-panel #users-filter-list { list-style-type: none; padding: 0; }';
                content += '#work-panel #users-filter-list li { border: 1px dashed rgba(0,0,0,0.05); border-radius: 2px; cursor: pointer; }';
                content += '#work-panel #users-filter-list li:hover { background-color: rgba(0,255,0,0.05); }';
                content += '#work-panel .form-check-input { margin-top: 0.15rem; }';
                content += '#work-panel .input-group .input-group-text { font-size: 0.75rem; }';
                content += '#work-panel #analise-result { font-size: 0.75rem; min-height: 40vh; }';
                content += '#work-panel #whoises-result-table td { vertical-align: middle; }';
                content += '#work-panel #result-table-box { font-size: 0.75rem; height: 50vh; overflow-y:auto; }';
                content += '@media (min-width: 576px) {' +
                    '.modal-lg { width: 90%; max-width: 1000px;}' +
                    '}';
                this.head.append('<style type="text/css">' + content + '</style>');
            },

            init: function () {
                if (!this.isLoadJQuery())
                    return;
                this.includeBS();
                this.initCustomStyles();
            }
        }

        var Disk = function (storage) {
            this.storage = storage;

            this.get = function (key) {
                return this.storage.getItem(key);
            };

            this.set = function (key, val) {
                this.storage.setItem(key, val);
            };
        };

        var Ajax = function () {

            this.init = function (url, method, params, dataType, initLoader, onsuccess, onfailure) {
                var loader = $('#page-loader');
                if (url === '') return;
                if (initLoader) loader.show();
                $.ajax({
                    url: url,
                    method: method,
                    data: params,
                    dataType: dataType,
                    success: onsuccess,
                    error: onfailure,
                    complete: function () {
                        if (initLoader) loader.hide();
                    }
                });
            }
        };

        var Notify = function () {
            this.show = function (message, context) {
                var box = $('#notify-container');
                var alertBox = box.find('.alert');
                alertBox.addClass('bg-' + context);
                alertBox.html(message);
                box.stop().fadeOut(0).fadeIn('slow');
                setTimeout(function () {
                    box.fadeOut(500);
                }, 2000);
                setTimeout(function () {
                    alertBox.removeClass('bg-' + context);
                    alertBox.html('');
                }, 2800);
            };
        };

        var Templater = function () {

            this.addPageLoader = function (el) {
                el.append($('<div/>', {
                    id: 'page-loader',
                    html: $('<i/>', {
                        class: 'fa fa-spinner fa-pulse fa-3x fa-fw'
                    })
                }));
            };

            this.addNotifyBox = function (el) {
                el.append($('<div/>', {
                    id: 'notify-container',
                    html: $('<div/>', {
                        class: 'alert'
                    })
                }));
            };

            this.addWorkModal = function (el) {
                $('<div/>', {
                    id: 'work-panel',
                    class: 'modal fade',
                    tabIndex: '-1',
                    role: 'dialog',
                    "aria-hidden": 'true',
                    "data-backdrop": 'static',
                    "data-keyboard": 'false',
                    html: $('<div/>', {
                        class: 'modal-dialog modal-lg',
                        role: 'document',
                        html: $('<div/>', {
                            class: 'modal-content',
                            html: $('<div/>', {
                                class: 'modal-header p-2 bg-info',
                                html: '<span class="modal-title"></span><button type="button" class="close" data-dismiss="modal" aria-label="Close" style="font-size: 1rem;"><span aria-hidden="true">&times;</span></button>'
                            }).add($('<div/>', {
                                class: 'modal-body text-center',
                                html: '<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>'
                            })).add($('<div/>', {
                                class: 'modal-footer d-none'
                            }))
                        })
                    })
                }).appendTo(el);
                var intersectionLink = $('<a/>', {
                    id: 'show-intersections-modal',
                    class: 'dropdown-item bg-danger text-white rounded border-dark mb-1',
                    href: '#',
                    html: '<i class="fa fa-users"></i> Пересечения'
                });
                var whoisesLink = $('<a/>', {
                    id: 'show-whoises-modal',
                    class: 'dropdown-item bg-danger text-white rounded border-dark mb-2',
                    href: '#',
                    html: '<i class="fa fa-globe"></i> Хуизатор'
                });
                var btnGroup = $('<div/>', {
                    id: 'wrench-btn-group',
                    class: 'btn-group',
                    role: 'group',
                    html: $('<button/>', {
                        id: 'wrench-group-show',
                        type: 'button',
                        class: 'btn btn-info dropdown-toggle',
                        "data-toggle": 'dropdown',
                        "aria-haspopup": 'true',
                        "aria-expanded": 'false',
                        html: '<i class="fa fa-wrench"></i>'
                    }).add($('<div/>', {
                        class: 'dropdown-menu p-0 border-0',
                        "aria-labelledby": 'wrench-group-show',
                        html: intersectionLink.add(whoisesLink)
                    }))
                }).appendTo(el);
            };

            this.addModalTitle = function (el, content) {
                el.find('.modal-title').html(content);
            };

            this.addHtmlCard = function (parent, id, title) {
                parent.html($('<div/>', {
                    id: id,
                    class: 'card',
                    html: $('<div/>', {
                        class: 'card-header py-1 px-2 text-left',
                        html: title
                    }).add($('<div/>', {
                        class: 'card-body py-1 px-2'
                    }))
                }));
            };

            this.addUsersAddForm = function (el) {
                var field = $('<input/>', {
                    id: 'add-user-id',
                    class: 'form-control my-0',
                    type: 'text',
                    placeholder: 'ID персонажа'
                });
                var btn = $('<button/>', {
                    class: 'btn btn-info add-user-in-list',
                    html: '<i class="fa fa-plus"></i> Добавить'
                });
                var form = $('<div/>', {
                    id: 'user-add-box',
                    class: 'row my-1',
                    html: $('<div/>', {
                        class: 'col',
                        html: $('<div/>', {
                            class: 'input-group input-group-sm',
                            html: field.add($('<div/>', {
                                class: 'input-group-append',
                                html: btn
                            }))
                        })
                    })
                });
                el.html(form);
                field.on('keyup', function () {
                    var val = $(this).val();
                    var cl_val = val.replace(/[^0-9\.]+/, '');
                    if (val !== cl_val) $(this).val(cl_val);
                });
            };

            this.addUsersFilterList = function (el) {
                el.append($('<ul/>', {
                    id: 'users-filter-list',
                    class: 'my-2'
                }));
            };

            this.addUserItemIntoFilterList = function (el, data) {
                el.append($('<li/>', {
                    class: 'font-weight-bold p-1 my-1',
                    html: $('<div/>', {
                        class: 'row align-items-center',
                        html: $('<div/>', {
                            class: 'col',
                            html: $('<div/>', {
                                class: 'form-check text-left text-info',
                                html: $('<input/>', {
                                    id: 'cbu_' + data.id,
                                    type: 'checkbox',
                                    class: 'form-check-input check-user-in-filter'
                                }).val(data.id).add($('<label/>', {
                                    class: 'form-check-label d-block',
                                    for: 'cbu_' + data.id,
                                    text: data.name
                                }))
                            })
                        }).add($('<div/>', {
                            class: 'col-auto',
                            html: $('<button/>', {
                                class: 'remove-user-from-filter btn btn-sm btn-danger p-1',
                                html: '<i class="fa fa-remove"></i>'
                            }).data('uid', data.id)
                        }))
                    })
                }));
            };

            this.addUsersIntoFilterList = function (el, data) {
                var _this = this;
                var counter = 0;
                el.html('');
                $.each(data, function (i, val) {
                    _this.addUserItemIntoFilterList(el, val);
                    counter++;
                });
                if (counter > 0)
                    el.show();
                else
                    el.hide();
            };

            this.addPeriodsMultiselect = function (el) {
                var periods = $('.wb > select[name=period]');
                if (typeof periods === "undefined")
                    return;
                var select = $('<select/>', {
                    id: 'periods-select',
                    class: 'custom-select p-1 my-1',
                    multiple: true
                }).prop('size', 8);
                $.each(periods.find('option'), function (i, val) {
                    select.append($('<option>', {
                        value: val.value,
                        text: val.text,
                        selected: i === 0
                    }));
                });
                el.html(select);
                el.append($('<div/>', {
                    html: $('<a/>', {
                        id: 'periods-check-all',
                        class: 'badge badge-info',
                        href: '#',
                        text: 'отметить все'
                    })
                }));
                el.append($('<small/>', {
                    class: 'text-danger',
                    text: '* можно указать несколько значений через Ctrl или Shift'
                }));
            };

            this.addIntervalField = function (el) {
                var field = $('<input/>', {
                    id: 'analise-time-interval',
                    class: 'form-control my-0 text-center',
                    type: 'text',
                    value: 5,
                    maxLength: 3
                }).attr('size', 3);
                var form = $('<div/>', {
                    class: 'input-group input-group-sm',
                    html: $('<div/>', {
                        class: 'input-group-prepend',
                        html: $('<span/>', {
                            class: 'input-group-text',
                            text: 'Интервал'
                        })
                    }).add(field).add($('<div/>', {
                        class: 'input-group-append',
                        html: $('<span/>', {
                            class: 'input-group-text',
                            text: 'мин.'
                        })
                    }))
                });
                el.html(form);
                field.on('keyup', function () {
                    var val = $(this).val();
                    var cl_val = val.replace(/[^0-9\.]+/, '');
                    if (val !== cl_val) $(this).val(cl_val);
                });
                field.on('blur', function () {
                    var val = $(this).val();
                    if (val === '' || val <= 0) $(this).val(5);
                });
            };

            this.addSubmitButton = function (el, eid) {
                el.append($('<button/>', {
                    id: eid,
                    class: 'btn btn-danger btn-sm ml-2',
                    html: '<i class="fa fa-arrow-right"></i> Запустить'
                }));
            };

            this.addModalContent = function (el, type) {
                el.html($('<div/>', {
                    class: 'row no-gutters',
                    html: $('<div/>', {
                        id: 'users-card-box',
                        class: 'col-sm-6 pr-sm-1 mb-2'
                    }).add($('<div/>', {
                        id: 'periods-card-box',
                        class: 'col-sm-6 pl-sm-1 mb-2'
                    }))
                }));
                el.append($('<div/>', {
                    class: 'row mt-2 no-gutters',
                    html: $($('<div/>', {
                        class: 'col'
                    })).add($('<div/>', {
                        id: 'time-interval-box',
                        class: 'col-auto text-sm-center pb-2'
                    })).add($('<div/>', {
                        id: 'submit-button-box',
                        class: 'col-md-auto text-md-right text-sm-center pb-2'
                    }))
                }));
                if (type === 'intersect') {
                    el.append($('<div/>', {
                        class: 'form-group m-0',
                        html: $('<textarea/>', {
                            id: 'analise-result',
                            class: 'form-control d-none'
                        }).attr('readonly', true)
                    }));
                    el.append($('<div/>', {
                        id: 'hide-ip-checker-box',
                        class: 'text-left d-none mt-2',
                        html: $('<button/>', {
                            id: 'hide-show-ip-btn',
                            class: 'btn btn-warning btn-sm showed mx-1',
                            html: '<i class="fa fa-eye-slash"> Скрыть IP</i>'
                        }).add('<button/>', {
                            id: 'copy-log-to-board-btn',
                            class: 'btn btn-info btn-sm mx-1',
                            html: '<i class="fa fa-copy"> Копировать пересечения</i>'
                        })
                    }));
                } else if (type === 'whoises') {
                    var clrNtn = $('<button/>', {
                        id: 'whoises-filter-input-clear-btn',
                        class: 'btn btn-danger',
                        html: '<i class="fa fa-remove"></i>'
                    });
                    el.append($('<div/>', {
                        id: 'whoises-result-box',
                        class: 'd-none',
                        html: $('<div/>', {
                            class: 'row align-items-center no-gutters',
                            html: $('<div/>', {
                                class: 'col-md-4 col-sm-6',
                                html: $('<div/>', {
                                    class: 'input-group input-group-sm my-1',
                                    html: $('<div/>', {
                                        class: 'input-group-prepend',
                                        html: $('<span/>', {
                                            id: 'addon-for-filter-whoizer-field',
                                            class: 'input-group-text bg-info text-white border-right-0',
                                            html: '<i class="fa fa-filter"></i>'
                                        })
                                    }).add($('<input/>', {
                                        id: 'filter-whoizer-field',
                                        type: 'text',
                                        class: 'form-control my-0',
                                        placeholder: 'Строка для поиска',
                                        "aria-describedby": "addon-for-filter-whoizer-field"
                                    })).add($('<div/>', {
                                        class: 'input-group-append',
                                        html: clrNtn
                                    }))
                                })
                            }).add($('<div/>', {
                                class: 'col-md-4 col-sm-6 pl-sm-2 offset-md-4 pl-md-2',
                                html: $('<div/>', {
                                    class: 'row align-items-center no-gutters',
                                    html: $('<div/>', {
                                        class: 'col-auto',
                                        html: $('<span/>', {
                                            id: 'whois-preloader',
                                            class: 'pr-1 d-none',
                                            html: '<i class="fa fa-spinner fa-pulse fa-fw"></i>'
                                        })
                                    }).add($('<div/>', {
                                        class: 'col',
                                        html: $('<div/>', {
                                            id: 'status-progress-bar',
                                            class: 'progress d-none',
                                            html: $('<div/>', {
                                                class: 'progress-bar progress-bar-striped progress-bar-animated bg-info',
                                                role: 'progressbar',
                                                "aria-valuemin": 0,
                                                "aria-valuemax": 100,
                                            }).css({ width: 0 })
                                        })
                                    }))
                                })
                            }))
                        }).add($('<div/>', {
                            id: 'result-table-box',
                            html: $('<table/>', {
                                id: 'whoises-result-table',
                                class: 'table table-striped table-bordered table-hover table-sm m-0'
                            })
                        }))
                    }));
                }
            }
        };

        var Application = function (templater, settings, storage) {

            this.init = function (body) {
                templater.addPageLoader(body);
                templater.addNotifyBox(body);
                templater.addWorkModal(body);
                if (storage.get(settings.usersStoreKey) === null) {
                    storage.set(settings.usersStoreKey, JSON.stringify([]));
                }
            };

            this.buildUsersForm = function () {
                templater.addHtmlCard($('#users-card-box'), 'users-card', 'Персонажи');
                templater.addUsersAddForm($('#users-card').find('.card-body'));
                templater.addUsersFilterList($('#users-card').find('.card-body'));
                templater.addHtmlCard($('#periods-card-box'), 'periods-card', 'Период');
                templater.addPeriodsMultiselect($('#periods-card').find('.card-body'));
            };

            this.addUsersIntoFilter = function () {
                templater.addUsersIntoFilterList($('#users-filter-list'), JSON.parse(storage.get(settings.usersStoreKey)));
            };

            this.intersectionsBuild = function () {
                templater.addModalTitle($('#work-panel'), '<i class="fa fa-search"></i> Поиск пересечений');
                templater.addModalContent($('#work-panel').find('.modal-body'), 'intersect');
                this.buildUsersForm();
                templater.addIntervalField($('#time-interval-box'));
                templater.addSubmitButton($('#submit-button-box'), 'start-analise-btn');
                this.addUsersIntoFilter();
            };

            this.whoisesBuild = function () {
                templater.addModalTitle($('#work-panel'), '<i class="fa fa-globe"></i> Хуизатор');
                templater.addModalContent($('#work-panel').find('.modal-body'), 'whoises');
                this.buildUsersForm();
                templater.addSubmitButton($('#submit-button-box'), 'start-whoises-btn');
                this.addUsersIntoFilter();
            };
        };

        var DataHelper = function () {

            this.checkIssetItemInObjectsList = function (list, key, val) {
                if (typeof list === 'object') {
                    for (var i = 0; i < list.length; i++) {
                        if (typeof list[i] === 'object' && key in list[i] && list[i][key] === val) {
                            return true;
                        }
                    }
                }
                return false;
            };

            this.removeItemFromObjectsList = function (list, key, val) {
                if (typeof list === 'object') {
                    for (var i = 0; i < list.length; i++) {
                        if (typeof list[i] === 'object' && key in list[i] && list[i][key] === val) {
                            list.splice(i, 1);
                            return list;
                        }
                    }
                }
                return list;
            };
        };

        var Analizer = function () {

            this.preloader = null;
            this.users = [];
            this.usersNames = [];
            this.periods = [];
            this.interval = 0;
            this.user_1 = null;
            this.user_2 = null;
            this.currentPeriod = null;
            this.currentUser = null;
            this.userLog_1 = [];
            this.userLog_2 = [];
            this.intersectionData = [];

            this.init = function (users, periods, interval) {
                this.preloader = $('#page-loader');
                this.users = users;
                this.periods = periods;
                this.interval = parseInt(interval) * 60 * 1000;
                this.usersNames = [];
                this.user_1 = null;
                this.user_2 = null;
                this.currentPeriod = null;
                this.currentUser = null;
                this.userLog_1 = [];
                this.userLog_2 = [];
                this.intersectionData = [];
                this.preloader.show();
            };

            this.setUsersNames = function (names) {
                this.usersNames = names;
            };

            this.start = function () {
                if (this.users.length === 2 && this.periods.length > 0 && this.interval > 0) {
                    this.user_1 = this.users[0];
                    this.user_2 = this.users[1];
                    this.currentPeriod = this.periods.shift();
                    this.currentUser = 1;
                    this.loadData();
                } else {
                    this.preloader.hide();
                    this.showParseResult(true);
                }
            };

            this.loadData = function () {
                var _this = this;
                setTimeout(function () {
                    var userID = (_this.currentUser === 1) ? _this.user_1 : _this.user_2;
                    new Ajax().init(
                        'http://www.gwars.ru/special.iparchive.php',
                        'get',
                        {
                            check: userID,
                            period: _this.currentPeriod
                        },
                        'html',
                        false,
                        function (r) {
                            _this.parseData(r, userID);
                        },
                        function () {
                            new Notify().show('Что-то пошло не так!', 'danger');
                            _this.preloader.hide();
                        }
                    );
                }, 300);
            };

            this.parseData = function (r, userID) {
                var dataFind = [];
                var res = $($.parseHTML(r)).find('center:contains("Результат для ")').parent().html();
                if (typeof res !== "undefined") {
                    var regIP = new RegExp('(\\d{4}-\\d{2}-\\d{2})\\s?(\\d{2}:\\d{2}:\\d{2})?[^>]+>(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})', 'ig');
                    var data = res.match(regIP);
                    if (data !== null) {
                        var item, parseData, ts, date, ip;
                        regIP = new RegExp('(\\d{4}-\\d{2}-\\d{2})\\s?(\\d{2}:\\d{2}:\\d{2})?[^>]+>(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})', 'i');
                        while (data.length > 0) {
                            item = data.shift();
                            parseData = regIP.exec(item);
                            if (typeof parseData === 'object' && parseData !== null) {
                                ip = parseData[3];
                                date = parseData[1];
                                if (parseData[2] !== undefined) {
                                    date += ' ' + parseData[2];
                                }
                                ts = this.getDateTs(date);
                                dataFind.push({
                                    used: false,
                                    id: userID,
                                    ts: ts,
                                    date: date,
                                    ip: ip
                                });
                            }
                        }
                    }
                } else {
                    new Notify().show('Страница логов недоступна!', 'danger');
                    this.preloader.hide();
                    return false;
                }
                res = null;
                if (dataFind.length !== 0) {
                    if (this.currentUser === 1) {
                        this.userLog_1 = dataFind;
                        this.currentUser = 2;
                        this.loadData();
                    } else {
                        this.userLog_2 = dataFind;
                        this.checkUsersIntersection();
                        this.start();
                    }
                    dataFind = null;
                } else {
                    this.start();
                }
            };

            this.getDateTs = function (dt) {
                var res = 0;
                if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/.test(dt)) {
                    var parts = /^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})$/.exec(dt);
                    if (parts !== null) {
                        res = new Date(
                            parseInt(parts[1]),
                            parseInt(parts[2]) - 1,
                            parseInt(parts[3]),
                            parseInt(parts[4]),
                            parseInt(parts[5]),
                            parseInt(parts[6])
                        ).getTime();
                    }
                } else if (/^\d{4}-\d{2}-\d{2}$/.test(dt)) {
                    var parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dt);
                    if (parts !== null) {
                        res = new Date(
                            parseInt(parts[1]),
                            parseInt(parts[2]) - 1,
                            parseInt(parts[3]),
                            0,
                            0,
                            0
                        ).getTime();
                    }
                }
                return res;
            };

            this.checkUsersIntersection = function () {
                var longLog_1 = this.userLog_1.length;
                var longLog_2 = this.userLog_2.length;
                if (longLog_1 > 0 && longLog_2 > 0 && this.interval > 0) {
                    var log_1 = (longLog_1 < longLog_2) ? this.userLog_1 : this.userLog_2;
                    var log_2 = (longLog_1 < longLog_2) ? this.userLog_2 : this.userLog_1;
                    var ts_1, ts_2, ip_1, ip_2;
                    for (var i = 0; i < log_1.length; i++) {
                        ts_1 = log_1[i].ts;
                        ip_1 = log_1[i].ip;
                        for (var j = 0; j < log_2.length; j++) {
                            if (log_2[j].used === true) continue;
                            ts_2 = log_2[j].ts;
                            ip_2 = log_2[j].ip;
                            if ((Math.abs(ts_1 - ts_2) <= this.interval) && ip_1 === ip_2) {
                                this.intersectionData.push({
                                    user_1: log_1[i],
                                    user_2: log_2[j]
                                });
                                log_2[j].used = true;
                                break;
                            }
                        }
                    }
                    log_1 = null;
                    log_2 = null;
                }
                this.userLog_1 = null;
                this.userLog_2 = null;
            };

            this.getUserName = function (id) {
                var key = 'u' + id;
                if (key in this.usersNames) {
                    return this.usersNames[key];
                }
                return '';
            };

            this.showParseResult = function (fromIP) {
                var _this = this;
                if (this.intersectionData.length > 0) {
                    var content = '', item = '', user_1, user_2;
                    $.each(this.intersectionData, function (i, val) {
                        user_1 = (val.user_1.ts < val.user_2.ts) ? val.user_1 : val.user_2;
                        user_2 = (val.user_1.ts < val.user_2.ts) ? val.user_2 : val.user_1;
                        item = user_1.date + ' ';
                        if (fromIP) item += user_1.ip + '  ';
                        item += _this.getUserName(user_1.id) + '\n';
                        item += user_2.date + ' ';
                        if (fromIP) item += user_2.ip + '  ';
                        item += _this.getUserName(user_2.id) + '\n\n';
                        content += item;
                    });
                    $('#analise-result').val(content.trim()).removeClass('d-none');
                    this.initShowIpButton(true);
                    $('#hide-ip-checker-box').removeClass('d-none');
                } else {
                    new Notify().show('Пересечений не найдено!', 'warning');
                }
            };

            this.initShowIpButton = function (isShow) {
                var btn = $('#hide-show-ip-btn');
                if (isShow) {
                    btn.removeClass('btn-danger').addClass('showed').addClass('btn-warning');
                } else {
                    btn.removeClass('btn-warning').removeClass('showed').addClass('btn-danger');
                }
                var content = (isShow) ? '<i class="fa fa-eye-slash"> Скрыть IP</i>' : '<i class="fa fa-eye"> Показать IP</i>';
                btn.html(content);
            }
        };

        var Whoizer = function () {

            this.preloader = null;

            this.user = null;
            this.periods = [];
            this.currentPeriod = null;
            this.counter = 0;
            this.currentCounter = 0;

            this.init = function (user, periods) {
                this.preloader = $('#page-loader');
                this.user = user;
                this.periods = periods;
                this.currentPeriod = null;
                this.counter = periods.length;
                this.currentCounter = 0;
                this.preloader.show();
                $('#whoises-result-box').removeClass('d-none');
            };

            this.displayProgressBar = function (isShow) {
                var loader = $('#whois-preloader');
                var bar = $('#status-progress-bar');
                if (isShow) {
                    bar.removeClass('d-none');
                    loader.removeClass('d-none');
                } else {
                    bar.addClass('d-none');
                    loader.addClass('d-none');
                }
            };

            this.getTotalRows = function () {
                return $('#whoises-result-table').find('tr').length;
            };

            this.getNotWaitedRows = function () {
                return $('#whoises-result-table').find('tr:not(.wait)').length;
            };

            this.initProgressBar = function () {
                var val = 100 * this.currentCounter / this.counter
                $('#status-progress-bar').find('.progress-bar').css({'width': val + '%' });
            };

            this.start = function () {
                this.initProgressBar();
                if (this.user !== null && this.periods.length > 0) {
                    this.currentCounter++;
                    this.currentPeriod = this.periods.shift();
                    this.loadData();
                } else {
                    this.counter = this.getTotalRows();
                    this.currentCounter = 0;
                    this.initProgressBar();
                    this.preloader.hide();
                    this.startWhois();
                }
            };

            this.loadData = function () {
                var _this = this;
                setTimeout(function () {
                    new Ajax().init(
                        'http://www.gwars.ru/special.iparchive.php',
                        'get',
                        {
                            check: _this.user,
                            period: _this.currentPeriod
                        },
                        'html',
                        false,
                        function (r) {
                            _this.parseData(r);
                        },
                        function () {
                            new Notify().show('Что-то пошло не так!', 'danger');
                            _this.preloader.hide();
                        }
                    );
                }, 300);
            };

            this.parseData = function (r) {
                var dataFind = [];
                var res = $($.parseHTML(r)).find('center:contains("Результат для ")').parent().html();
                if (typeof res !== "undefined") {
                    var regIP = new RegExp('(\\d{4}-\\d{2}-\\d{2})\\s?(\\d{2}:\\d{2}:\\d{2})?[^>]+>(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})', 'ig');
                    var data = res.match(regIP);
                    if (data !== null) {
                        var item, parseData, ts, date, ip;
                        regIP = new RegExp('(\\d{4}-\\d{2}-\\d{2})\\s?(\\d{2}:\\d{2}:\\d{2})?[^>]+>(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})', 'i');
                        while (data.length > 0) {
                            item = data.shift();
                            parseData = regIP.exec(item);
                            if (typeof parseData === 'object' && parseData !== null) {
                                ip = parseData[3];
                                date = parseData[1];
                                if (parseData[2] !== undefined) {
                                    date += ' ' + parseData[2];
                                }
                                dataFind.push({
                                    date: date,
                                    ip: ip
                                });
                            }
                        }
                    }
                } else {
                    new Notify().show('Страница логов недоступна!', 'danger');
                    this.preloader.hide();
                    return false;
                }
                res = null;
                if (dataFind.length !== 0) {
                    this.appendResult(dataFind);
                    this.start();
                    dataFind = null;
                } else {
                    this.start();
                }
            };

            this.appendResult = function (whoisesData) {
                var table = $('#whoises-result-table');
                if (whoisesData.length > 0) {
                    var content = '', item = '', user_1, user_2;
                    $.each(whoisesData, function (i, val) {
                        table.append($('<tr>', {
                            class: 'wait text-muted bg-light',
                            html: '<td width="5%"><nobr>' + val.date + '</nobr></td><td width="5%"><nobr><span class="ip">' + val.ip + '</span></nobr></td><td class="country"></td><td class="provider"></td>'
                        }));
                    });
                }
            };

            this.startWhois = function () {
                this.currentCounter = this.getNotWaitedRows();
                this.initProgressBar();
                var row = $('#whoises-result-table').find('tr.wait').first();
                if (typeof row !== "undefined" && row.length > 0) {
                    var ip = row.find('.ip').text();
                    this.loadIpData(ip, row);
                } else {
                    this.displayProgressBar(false);
                    if (this.counter === 0) {
                        new Notify().show('Логи в выбранных периодах не найдены!', 'secondary');
                    }
                }
            };

            this.loadIpData = function (ip, el) {
                var _this = this;
                setTimeout(function () {
                    new Ajax().init(
                        'http://ip-api.com/json/' + ip,
                        'get',
                        {
                            lang: 'ru'
                        },
                        'json',
                        false,
                        function (r) {
                            _this.pushIpData(r, el, ip);
                        },
                        function () {
                            new Notify().show('Whois-сервер недоступен!', 'danger');
                            _this.preloader.hide();
                        }
                    );
                }, 600);
            };

            this.getProviderData = function (data) {
                return (typeof data === 'object' && data.isp !== '') ? data.isp : '';
            };

            this.getCountryData = function (data) {
                if (typeof data === 'object') {
                    var country = '';
                    var country_code = data.countryCode;
                    if (country_code !== "") {
                        country += '<img src="https://cdn.ipwhois.io/flags/' + country_code.toLowerCase() + '.svg" style="height: 16px; width: auto; margin-right:0.25rem;" class="border" />';
                        country += '[' + country_code + ']';
                    }
                    var city = data.city;
                    if (city !== "")
                        country += ' ' + city;
                    var region = data.regionName;
                    if (region !== "" && region !== data.country && region !== city)
                        country += ' (' + region + ')';
                    return country;
                }
            };

            this.pushIpData = function (data, el, ip) {
                var reqSuccess = (typeof data === 'object' && data.status === 'success') ? true : false;
                var country = (reqSuccess) ? this.getCountryData(data) : '';
                var provider = (reqSuccess) ? this.getProviderData(data) : '';
                el.find('.country').html(country);
                el.find('.provider').html(provider);
                this.findSimularIps(ip, country, provider);
                this.startWhois();
            };

            this.findSimularIps = function (ip, country, provider) {
                var partIp = ip.substring(0, ip.lastIndexOf(".") + 1);
                if (partIp !== '') {
                    var rows = $('#whoises-result-table').find('tr.wait .ip:contains("' + partIp + '")');
                    if (rows.length > 0) {
                        $.each(rows, function (i) {
                            var row = $(this).closest('tr');
                            row.find('.country').html(country);
                            row.find('.provider').html(provider);
                            row.removeClass('wait').removeClass('text-muted').removeClass('bg-light');
                        });
                    }
                }
            };

            this.displayAllRows = function () {
                $('#whoises-result-table').find('tr').removeClass('d-none');
            };

            this.hideRowByContext = function (text) {
                $('#whoises-result-table').find('tr').each(function () {
                    if ($(this).text().toLowerCase().indexOf(text.toLowerCase()) !== -1)
                        $(this).removeClass('d-none');
                    else
                        $(this).addClass('d-none');
                });
            };

            this.clearFilterField = function () {
                $('#filter-whoizer-field').val('');
                this.displayAllRows();
            };

            this.clearResultsTable = function () {
                $('#whoises-result-table').html('');
            };
        };

        var timer = null;
        var sett = new Settings();
        sett.init();
        var notify = new Notify();
        var storage = sett.store;
        var data = new DataHelper();
        var templater = new Templater();
        var app = new Application(templater, sett, storage);
        app.init(sett.body);
        var analizer = new Analizer();
        var whoizer = new Whoizer();

        var workPanel = $('#work-panel');

        $('#show-intersections-modal').on('click', function () {
            app.intersectionsBuild();
            workPanel.modal();
        });

        $('#show-whoises-modal').on('click', function () {
            app.whoisesBuild();
            workPanel.modal();
        });

        workPanel.on('click', '.add-user-in-list', function () {
            var uidf = $('#add-user-id');
            var uid = parseInt(uidf.val());
            if (uid > 0) {
                var users = JSON.parse(storage.get(sett.usersStoreKey));
                users = (users === null) ? [] : users;
                if (!data.checkIssetItemInObjectsList(users, 'id', uid)) {
                    new Ajax().init(
                        'http://www.gwars.ru/info.php',
                        'get',
                        {id: uid},
                        'html',
                        true,
                        function (r) {
                            var res = $($.parseHTML(r)).find('#namespan > b').text();
                            if (res !== '') {
                                users.push({id: uid, name: res});
                                storage.set(sett.usersStoreKey, JSON.stringify(users));
                                uidf.val('');
                                templater.addUsersIntoFilterList($('#users-filter-list'), users);
                            } else {
                                notify.show('Персонаж не найден!', 'danger')
                            }
                            res = null;
                        }
                    );
                } else {
                    notify.show('Персонаж уже есть в списке!', 'danger')
                }
            } else {
                uidf.focus();
            }
        });

        workPanel.on('click', '.remove-user-from-filter', function () {
            var uid = parseInt($(this).data('uid'));
            if (uid > 0) {
                var users = JSON.parse(storage.get(sett.usersStoreKey));
                users = data.removeItemFromObjectsList(users, 'id', uid);
                storage.set(sett.usersStoreKey, JSON.stringify(users));
                templater.addUsersIntoFilterList($('#users-filter-list'), users);
            }
        });

        workPanel.on('change', '.check-user-in-filter', function () {
            var filterList = $('#users-filter-list');
            var count = filterList.find('.check-user-in-filter:checked').length;
            var maxCheck = ($('#work-panel').find('.modal-title i').hasClass('fa-globe')) ? 1 : 2;
            filterList.find('.check-user-in-filter').not(':checked').attr('disabled', count >= maxCheck);
        });

        workPanel.on('click', '#periods-check-all', function (e) {
            e.preventDefault();
            $('#periods-select').find('option').prop('selected', true);
            return false;
        });

        workPanel.on('click', '#start-analise-btn', function () {
            $('#analise-result').val('').addClass('d-none');
            $('#hide-ip-checker-box').addClass('d-none');
            var users = [];
            var usersNames = [];
            var checkedUsersFields = $('#users-filter-list').find('.check-user-in-filter:checked');
            if (checkedUsersFields.length !== 2) {
                notify.show('Не выбраны персонажи для анализа!', 'danger');
                return false;
            }
            var checkedPeriods = $('#periods-select').val();
            if (checkedPeriods === null || checkedPeriods.length === 0) {
                notify.show('Не указан период для анализа!', 'danger');
                return false;
            }
            if (checkedPeriods.indexOf("0") !== -1 && checkedPeriods.indexOf("-1") !== -1) {
                checkedPeriods.splice(checkedPeriods.indexOf("-1"), 1);
            }
            var interval = $('#analise-time-interval').val();
            if (interval === '' || parseInt(interval) <= 0) {
                notify.show('Не указан интервал!', 'danger');
                return false;
            }
            $.each(checkedUsersFields, function () {
                var chID = $(this).val();
                users.push(chID);
                var chName = $(this).closest('.form-check').find('label').text();
                usersNames['u' + chID] = chName;
            });
            var periods = checkedPeriods.sort(function (a, b) {
                a = parseInt(a);
                b = parseInt(b);
                if (a <= 0) a += 1000;
                if (b <= 0) b += 1000;
                if (a > b) return 1;
                if (a < b) return -1;
                return 0;
            });
            analizer.init(users, periods, interval);
            analizer.setUsersNames(usersNames);
            analizer.start();
        });

        workPanel.on('click', '#hide-show-ip-btn', function () {
            var is_show = $(this).hasClass('showed');
            analizer.showParseResult(!is_show);
            analizer.initShowIpButton(!is_show);
        });

        workPanel.on('click', '#copy-log-to-board-btn', function () {
            var elem = document.getElementById('analise-result');
            var target, origSelectionStart, origSelectionEnd;
            target = elem;
            origSelectionStart = elem.selectionStart;
            origSelectionEnd = elem.selectionEnd;
            var currentFocus = document.activeElement;
            target.focus();
            target.setSelectionRange(0, target.value.length);
            var succeed;
            try {
                succeed = document.execCommand("copy");
            } catch (e) {
                succeed = false;
            }
            if (currentFocus && typeof currentFocus.focus === "function") {
                currentFocus.focus();
            }
            elem.setSelectionRange(origSelectionStart, origSelectionEnd);
            if (succeed) {
                notify.show('Скопировано в буфер обмена!', 'success');
            } else {
                notify.show('Информация не скопирована!', 'danger');
            }
            return succeed;
        });


        workPanel.on('click', '#start-whoises-btn', function () {
            whoizer.clearResultsTable();
            var checkedUsersFields = $('#users-filter-list').find('.check-user-in-filter:checked');
            if (checkedUsersFields.length === 0) {
                notify.show('Не выбран персонаж для анализа!', 'danger');
                return false;
            }
            var checkedPeriods = $('#periods-select').val();
            if (checkedPeriods === null || checkedPeriods.length === 0) {
                notify.show('Не указан период для анализа!', 'danger');
                return false;
            }
            if (checkedPeriods.indexOf("0") !== -1 && checkedPeriods.indexOf("-1") !== -1) {
                checkedPeriods.splice(checkedPeriods.indexOf("-1"), 1);
            }
            var user = checkedUsersFields.val();
            var periods = checkedPeriods.sort(function (a, b) {
                a = parseInt(a);
                b = parseInt(b);
                if (a <= 0) a += 1000;
                if (b <= 0) b += 1000;
                if (a > b) return 1;
                if (a < b) return -1;
                return 0;
            });
            whoizer.init(user, periods);
            whoizer.displayProgressBar(true);
            whoizer.start();
        });

        workPanel.on('keyup', '#filter-whoizer-field', function () {
            var val = $(this).val().trim();
            if (timer !== null) clearTimeout(timer);
            timer = setTimeout(function () {
                if (val !== '') {
                    whoizer.hideRowByContext(val);
                } else {
                    whoizer.displayAllRows();
                }
            }, 350);
        });

        workPanel.on('click', '#whoises-filter-input-clear-btn', function () {
            whoizer.clearFilterField();
        });
    });
})();