import {
    Plus,
    Trash2,
} from "lucide-react";

import {
    useState,
} from "react";

type FaqRow = {
    id:
        string;

    question:
        string;

    answer:
        string;
};

const inputClass =
    "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#0c1724] outline-none transition focus:border-gold";

export function CmsDestinationFaqCreateFields() {
    const [
        faqs,
        setFaqs,
    ] =
        useState<
            FaqRow[]
        >([]);

    function addFaq() {
        setFaqs(
            (
                current,
            ) => [
                ...current,

                {
                    id:
                        crypto.randomUUID(),

                    question:
                        "",

                    answer:
                        "",
                },
            ],
        );
    }

    function changeFaq(
        id:
        string,

        field:
            "question" |
            "answer",

        value:
        string,
    ) {
        setFaqs(
            (
                current,
            ) =>
                current.map(
                    (
                        faq,
                    ) =>
                        faq.id ===
                        id
                            ? {
                                ...faq,

                                [field]:
                                value,
                            }
                            : faq,
                ),
        );
    }

    function removeFaq(
        id:
        string,
    ) {
        setFaqs(
            (
                current,
            ) =>
                current.filter(
                    (
                        faq,
                    ) =>
                        faq.id !==
                        id,
                ),
        );
    }

    /*
     * Completely blank rows are ignored.
     * Partially completed rows are preserved so the
     * server validator can reject them properly.
     */
    const serializedFaqs =
        faqs
            .filter(
                (
                    faq,
                ) =>
                    faq.question.trim() ||
                    faq.answer.trim(),
            )
            .map(
                (
                    faq,
                ) => ({
                    question:
                        faq.question.trim(),

                    answer:
                        faq.answer.trim(),
                }),
            );

    return (
        <section className="rounded-2xl border border-black/10 bg-white p-6">
            <h2 className="text-lg font-semibold text-[#0c1724]">
                Frequently Asked Questions
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
                Add destination-specific questions and answers shown to travellers.
            </p>

            <input
                type="hidden"
                name="faqs"
                value={
                    JSON.stringify(
                        serializedFaqs,
                    )
                }
            />

            <div className="mt-6 space-y-4">
                {faqs.length ? (
                    faqs.map(
                        (
                            faq,
                            index,
                        ) => (
                            <div
                                key={
                                    faq.id
                                }
                                className="rounded-xl border border-black/10 bg-[#faf9f6] p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <p className="text-sm font-semibold text-[#0c1724]">
                                        FAQ {index + 1}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeFaq(
                                                faq.id,
                                            )
                                        }
                                        aria-label={`Remove FAQ ${index + 1}`}
                                        className="grid h-10 w-10 place-items-center rounded-xl border border-red-200 bg-white text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                <label className="mt-4 block">
                                    <span className="mb-2 block text-xs font-semibold text-[#0c1724]">
                                        Question
                                    </span>

                                    <input
                                        value={
                                            faq.question
                                        }
                                        placeholder="Example: What is the best time to visit?"
                                        onChange={(
                                            event,
                                        ) =>
                                            changeFaq(
                                                faq.id,
                                                "question",
                                                event.target.value,
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    />
                                </label>

                                <label className="mt-4 block">
                                    <span className="mb-2 block text-xs font-semibold text-[#0c1724]">
                                        Answer
                                    </span>

                                    <textarea
                                        rows={4}
                                        value={
                                            faq.answer
                                        }
                                        placeholder="Enter the answer shown to travellers."
                                        onChange={(
                                            event,
                                        ) =>
                                            changeFaq(
                                                faq.id,
                                                "answer",
                                                event.target.value,
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                    />
                                </label>
                            </div>
                        ),
                    )
                ) : (
                    <div className="rounded-xl border border-dashed border-black/10 bg-[#faf9f6] p-6 text-center text-sm text-muted-foreground">
                        No destination FAQs added yet.
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={
                    addFaq
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-[#0c1724]"
            >
                <Plus className="h-4 w-4" />

                Add FAQ
            </button>
        </section>
    );
}